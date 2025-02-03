import React, { useState, useEffect } from "react";
import { Table, Tag, Select, Input, Modal, message, Empty, Form, Button } from "antd";
import Sidebar from "../components/Sidebar/Siderbar";
import { createStyles } from 'antd-style';
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

import '../styles/alunos.scss'

const useStyle = createStyles(({ css, token }) => {
    const { antCls } = token;
    return {
        customTable: css`
        ${antCls}-table {
          ${antCls}-table-container {
            ${antCls}-table-body,
            ${antCls}-table-content {
              scrollbar-color: #eaeaea transparent;
            }
          }
        }
      `,
    };
});

const { Option } = Select;

function Alunos() {
    const { styles } = useStyle();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [alunoToDelete, setAlunoToDelete] = useState(null);

    // States
    const [alunos, setAlunos] = useState([]);
    const [filteredAlunos, setFilteredAlunos] = useState([]);
    const [selectedAluno, setSelectedAluno] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState({
        edit: false,
        view: false,
    });
    const [filters, setFilters] = useState({
        periodo: [],
        curso: [],
        search: "",
    });

    const [editForm] = Form.useForm();
    const [deleteForm] = Form.useForm();

    // Fetch alunos from API
    useEffect(() => {
        const fetchAlunos = async () => {
            try {
                const response = await fetch("http://localhost:5000/alunos");
                const data = await response.json();
                setAlunos(data);
                setFilteredAlunos(data);
            } catch (error) {
                console.error("Erro ao buscar alunos:", error);
            }
        };

        fetchAlunos();
    }, []);

    // Filtering logic
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        const filtered = alunos.filter((aluno) => {
            const matchesPeriodo =
                newFilters.periodo.length === 0 ||
                newFilters.periodo.includes(aluno.periodo);
            const matchesCurso =
                newFilters.curso.length === 0 ||
                newFilters.curso.includes(aluno.curso);
            const matchesSearch =
                aluno.nome.toLowerCase().includes(newFilters.search.toLowerCase());

            return matchesPeriodo && matchesCurso && matchesSearch;
        });

        setFilteredAlunos(filtered);
    };

    // Handle edit logic
    const handleEditAluno = (aluno) => {
        setSelectedAluno(aluno);
        setIsModalVisible({ ...isModalVisible, edit: true });
        editForm.setFieldsValue(aluno);
    };

    const confirmEditAluno = async () => {
        try {
            const updatedAluno = await editForm.validateFields();
            const response = await fetch(
                `http://localhost:5000/aluno/${selectedAluno.cpf}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedAluno),
                }
            );

            if (response.ok) {
                setAlunos((prevAlunos) =>
                    prevAlunos.map((aluno) =>
                        aluno.cpf === selectedAluno.cpf ? { ...aluno, ...updatedAluno } : aluno
                    )
                );
                setFilteredAlunos((prevAlunos) =>
                    prevAlunos.map((aluno) =>
                        aluno.cpf === selectedAluno.cpf ? { ...aluno, ...updatedAluno } : aluno
                    )
                );
                message.success("Aluno editado com sucesso!");
            } else {
                message.error("Erro ao editar o aluno!");
            }
        } catch (error) {
            console.error("Erro ao editar:", error);
            message.error("Erro ao editar o aluno!");
        } finally {
            setIsModalVisible({ ...isModalVisible, edit: false });
            setSelectedAluno(null);
        }
    };

    // View logic
    const handleViewAluno = (aluno) => {
        setSelectedAluno(aluno);
        setIsModalVisible({ ...isModalVisible, view: true });
    };

    const handleDeleteAluno = (aluno) => {
        setAlunoToDelete(aluno);
        setIsDeleteModalVisible(true);
    };

    const confirmDeleteAluno = async () => {
        if (!alunoToDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/aluno/${alunoToDelete.cpf}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setAlunos((prevAlunos) => prevAlunos.filter((aluno) => aluno.cpf !== alunoToDelete.cpf));
                setFilteredAlunos((prevAlunos) => prevAlunos.filter((aluno) => aluno.cpf !== alunoToDelete.cpf));
                message.success("Aluno excluído com sucesso!");
            } else {
                message.error("Erro ao excluir o aluno!");
            }
        } catch (error) {
            console.error("Erro ao excluir aluno:", error);
            message.error("Erro ao excluir o aluno!");
        } finally {
            setIsDeleteModalVisible(false);
            setAlunoToDelete(null);
        }
    };


    // Table columns
    const columns = [
        {
            title: "Nome",
            dataIndex: "nome",
            key: "nome",
            fixed: "left",
            width: 120,
        },
        {
            title: "Nascimento",
            dataIndex: "nascimento",
            key: "nascimento",
            width: 80,
            align: "center",
        },
        {
            title: "E-mail",
            dataIndex: "email",
            key: "email",
            width: 150,
        },
        {
            title: "CPF",
            dataIndex: "cpf",
            key: "cpf",
            width: 80,
        },
        {
            title: "CEP",
            dataIndex: "cep",
            key: "cep",
            width: 80,
        },
        {
            title: "Curso",
            dataIndex: "curso",
            key: "curso",
            width: 80,
        },
        {
            title: "Período",
            dataIndex: "periodo",
            key: "periodo",
            width: 80,
        },
        {
            title: "Ação",
            fixed: "right",
            width: 80,
            align: "center",
            render: (_, aluno) => (
                <span className="row-actions">
                    <FaEdit onClick={() => handleEditAluno(aluno)} style={{ cursor: "pointer", marginRight: "10px" }} />
                    <FaEye onClick={() => handleViewAluno(aluno)} style={{ cursor: "pointer", marginRight: "10px" }} />
                    <MdDelete onClick={() => handleDeleteAluno(aluno)} style={{ cursor: "pointer", color: "red" }} />
                </span>
            ),
        }
    ];

    return (
        <div className="container-usuarios">
            <Sidebar />
            <div className="content-usuarios">
                <h1>Alunos</h1>

                {/* Filters */}
                <div style={{ marginBottom: "20px" }} className="filter-row">
                    <Input
                        placeholder="Buscar por nome"
                        style={{ width: "200px", marginRight: "10px" }}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                    />
                    <Select
                        mode="multiple"
                        placeholder="Filtrar por período"
                        style={{ width: "200px", marginRight: "10px" }}
                        onChange={(value) => handleFilterChange("periodo", value)}
                    >
                        <Option value="Matutino">Matutino</Option>
                        <Option value="Vespertino">Vespertino</Option>
                        <Option value="Noturno">Noturno</Option>
                        <Option value="Sábado">Sábado</Option>
                    </Select>
                    <Select
                        mode="multiple"
                        placeholder="Filtrar por curso"
                        style={{ width: "200px" }}
                        onChange={(value) => handleFilterChange("curso", value)}
                    >
                        <Option value="Pré-Vestibular">Pré-Vestibular</Option>
                        <Option value="Pré-Técnico">Pré-Técnico</Option>
                        <Option value="Concurso Público">Concurso Público</Option>
                    </Select>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={filteredAlunos}
                    rowKey="cpf"
                    className={styles.customTable}
                    pagination={{ pageSize: 50 }}
                    bordered
                    scroll={{ x: 1800 }}
                    locale={{
                        emptyText: <Empty description="Sem alunos matriculados no momento :)" />,
                    }}
                />
            </div>

            {/* Edit Modal */}
            <Modal
                title="Editar Aluno"
                visible={isModalVisible.edit}
                onOk={confirmEditAluno}
                onCancel={() => setIsModalVisible({ ...isModalVisible, edit: false })}
                okText="Salvar"
                cancelText="Cancelar"
            >
                <Form layout="vertical" form={editForm}>
                    <Form.Item name="nome" label="Nome" rules={[{ required: true, message: "Nome é obrigatório!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="E-mail" rules={[{ type: "email", message: "E-mail inválido!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="curso" label="Curso">
                        <Input />
                    </Form.Item>
                    <Form.Item name="periodo" label="Período">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Modal */}
            <Modal
                title="Detalhes do Aluno"
                visible={isModalVisible.view}
                onCancel={() => setIsModalVisible({ ...isModalVisible, view: false })}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible({ ...isModalVisible, view: false })}>
                        Fechar
                    </Button>,
                ]}
            >
                <p><b>Nome:</b> {selectedAluno?.nome}</p>
                <p><b>CPF:</b> {selectedAluno?.cpf}</p>
                <p><b>E-mail:</b> {selectedAluno?.email}</p>
                <p><b>Curso:</b> {selectedAluno?.curso}</p>
                <p><b>Período:</b> {selectedAluno?.periodo}</p>
            </Modal>


            <Modal
                title="Confirmar Exclusão"
                visible={isDeleteModalVisible}
                onOk={confirmDeleteAluno}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Excluir"
                cancelText="Cancelar"
            >
                <p>Tem certeza de que deseja excluir o aluno <b>{alunoToDelete?.nome}</b>?</p>
            </Modal>
        </div>
    );
}

export default Alunos;