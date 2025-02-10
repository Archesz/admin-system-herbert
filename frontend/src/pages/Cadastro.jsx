import React, { useState } from "react";
import Siderbar from "../components/Sidebar/Siderbar";
import "../styles/cadastro.scss";
import jsPDF from "jspdf";

function Cadastro() {
  const [formData, setFormData] = useState({
    nome: "",
    nascimento: "",
    email: "",
    cpf: "",
    cep: "",
    curso: "",
    genero: "",
    etnia: "",
    periodo: "",
    whatsapp: "",
    ano: 2025,
    turma: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Cadastro de Estudante", 20, 20);
    doc.setFontSize(12);
    Object.keys(formData).forEach((key, index) => {
      doc.text(`${key}: ${formData[key]}`, 20, 40 + index * 10);
    });
    doc.save(`Cadastro_${formData.nome}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    generatePDF();

    try {
      const response = await fetch("http://localhost:5000/cadastrar-aluno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      alert(response.ok ? "Aluno cadastrado com sucesso!" : data.error || "Erro ao cadastrar aluno.");
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao cadastrar aluno.");
    }
  };

  return (
    <div className="container-cadastro">
      <Siderbar />
      <div className="content-cadastro">
        <h1>Cadastro de Estudantes</h1>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome:</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="nascimento">Data de Nascimento:</label>
              <input
                type="date"
                id="nascimento"
                name="nascimento"
                value={formData.nascimento}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cpf">CPF:</label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cep">CEP:</label>
              <input
                type="text"
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="whatsapp">Whatsapp:</label>
              <input
                type="text"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="genero">Gênero:</label>
              <select
                id="genero"
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o gênero</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não informar">
                  Prefiro não informar
                </option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="etnia">Etnia:</label>
              <select
                id="etnia"
                name="etnia"
                value={formData.etnia}
                onChange={handleChange}
                required
              >
                <option value="">Selecione a etnia</option>
                <option value="Branca">Branca</option>
                <option value="Preta">Preta</option>
                <option value="Parda">Parda</option>
                <option value="Amarela">Amarela</option>
                <option value="Indígena">Indígena</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="periodo">Período:</label>
              <select
                id="periodo"
                name="periodo"
                value={formData.periodo}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o período</option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Noturno">Noturno</option>
                <option value="Sábado">Sábado</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="curso">Curso:</label>
              <select
                id="curso"
                name="curso"
                value={formData.curso}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o curso</option>
                <option value="Pré-Vestibular">Pré-Vestibular</option>
                <option value="Pré-Técnico">Pré-Técnico</option>
                <option value="Concurso Público">Concurso Público</option>
              </select>
            </div>

          </div>

          <button type="submit" className="btn">
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Cadastro;
