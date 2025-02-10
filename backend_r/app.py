from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from flask_bcrypt import Bcrypt
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

app = Flask(__name__)
CORS(app) # Permitir requisições
app.config["SECRET_KEY"] = "chave_secreta"
jwt = JWTManager(app)
bcrypt = Bcrypt(app)


uri = "mongodb+srv://Arches:Giovana12@herbert.vp2ett8.mongodb.net/?retryWrites=true&w=majority&appName=Herbert"

# Conexão com o MongoDB
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["Herbert"]  # Nome da database
alunos_collection = db["Alunos_2025"]  # Nome da collection

users = {"admin@example.com": bcrypt.generate_password_hash("senha123").decode("utf-8"),
         "joaovitor@herbert.com": bcrypt.generate_password_hash("admin").decode("utf-8")}

@app.route("/")
def home():
    return jsonify({"message": "API funcionando."})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if email in users and bcrypt.check_password_hash(users[email], password):
        access_token = create_access_token(identity=email)
        return jsonify({"access_token": access_token}), 200
    
    return jsonify({"error": "Usuário ou senha inválidos"}), 401

@app.route("/cadastrar-aluno", methods=["POST"])
def cadastrar_aluno():
    try:
        # Recebe os dados do aluno enviados pelo frontend
        aluno_data = request.json
        print("ok")
        # Verifica se o CPF já está cadastrado
        cpf = aluno_data.get("cpf")
        if alunos_collection.find_one({"cpf": cpf}):
            return jsonify({"error": "CPF já cadastrado"}), 400

        # Insere o aluno na collection "Alunos"
        alunos_collection.insert_one(aluno_data)
        return jsonify({"message": "Aluno cadastrado com sucesso"}), 201

    except Exception as e:
        return jsonify({"error": f"Erro ao cadastrar aluno: {str(e)}"}), 500

@app.route("/alunos", methods=["GET"])
def get_alunos():
    try:
        # Busca todos os alunos na collection "Alunos"
        alunos = list(alunos_collection.find({}, {"_id": 0}))  # Não inclui o ID do MongoDB
        return jsonify(alunos), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao buscar alunos: {str(e)}"}), 500

@app.route("/aluno/<cpf>", methods=["DELETE"])
def desmatricular_aluno(cpf):
    try:
        # Tenta deletar o aluno com o CPF fornecido
        result = alunos_collection.delete_one({"cpf": cpf})
        if result.deleted_count > 0:
            return jsonify({"message": "Aluno desmatriculado com sucesso"}), 200
        else:
            return jsonify({"error": "Aluno não encontrado"}), 404

    except Exception as e:
        return jsonify({"error": f"Erro ao desmatricular aluno: {str(e)}"}), 500



@app.route("/aluno/<cpf>", methods=["PUT"])
def atualizar_aluno(cpf):
    try:
        # Dados enviados pelo frontend para atualização
        aluno_data = request.json

        # Verifica se o aluno com o CPF fornecido existe no banco de dados
        aluno_existente = alunos_collection.find_one({"cpf": cpf})
        if not aluno_existente:
            return jsonify({"error": "Aluno não encontrado"}), 404

        # Atualiza os dados do aluno no banco
        resultado = alunos_collection.update_one(
            {"cpf": cpf},  # Filtro para encontrar o aluno
            {"$set": aluno_data}  # Campos a serem atualizados
        )

        if resultado.modified_count > 0:
            return jsonify({"message": "Aluno atualizado com sucesso"}), 200
        else:
            return jsonify({"message": "Nenhuma alteração foi realizada"}), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao atualizar aluno: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)