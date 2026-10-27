import React, { useState, useEffect, useMemo } from "react";
import { Table, Tag, Select, Input, Modal, Empty, Button, Alert, Progress, Slider, InputNumber } from "antd";
import { FaChartLine } from "react-icons/fa";
import Sidebar from "../components/Sidebar/Siderbar";
import {
    CONCORRENCIA,
    calcularPrevisao,
    classificar,
    preverAprovacao,
} from "../services/previsao";

import "../styles/alunos.scss";
import "../styles/previsao.scss";

const { Option } = Select;

function Previsao() {
    const [previsoes, setPrevisoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ periodo: [], nivel: [], search: "" });
    const [selectedAluno, setSelectedAluno] = useState(null);
    const [simulacao, setSimulacao] = useState(null);

    // Busca os alunos do Pré-Vestibular e roda o modelo para cada um
    useEffect(() => {
        const fetchPrevisoes = async () => {
            try {
                const response = await fetch("http://localhost:5000/alunos");
                const data = await response.json();
                const vestibulandos = data.filter((aluno) => aluno.curso === "Pré-Vestibular");
                const resultados = await Promise.all(
                    vestibulandos.map(async (aluno) => ({ ...aluno, ...(await preverAprovacao(aluno)) }))
                );
                setPrevisoes(resultados);
            } catch (error) {
                console.error("Erro ao buscar alunos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrevisoes();
    }, []);

    const filteredPrevisoes = useMemo(
        () =>
            previsoes.filter((aluno) => {
                const matchesPeriodo =
                    filters.periodo.length === 0 || filters.periodo.includes(aluno.periodo);
                const matchesNivel =
                    filters.nivel.length === 0 ||
                    filters.nivel.includes(classificar(aluno.probabilidade).nivel);
                const matchesSearch = (aluno.nome || "")
                    .toLowerCase()
                    .includes(filters.search.toLowerCase());
                return matchesPeriodo && matchesNivel && matchesSearch;
            }),
        [previsoes, filters]
    );

    const resumo = useMemo(() => {
        const total = filteredPrevisoes.length;
        const media = total
            ? Math.round(filteredPrevisoes.reduce((soma, a) => soma + a.probabilidade, 0) / total)
            : 0;
        const contar = (nivel) =>
            filteredPrevisoes.filter((a) => classificar(a.probabilidade).nivel === nivel).length;
        return { total, media, alta: contar("Alta"), baixa: contar("Baixa") };
    }, [filteredPrevisoes]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleDetalhar = (aluno) => {
        setSelectedAluno(aluno);
        setSimulacao({ ...aluno.indicadores });
    };

    const fecharDetalhes = () => {
        setSelectedAluno(null);
        setSimulacao(null);
    };

    const resultadoSimulacao = simulacao ? calcularPrevisao(simulacao) : null;

    const columns = [
        {
            title: "Nome",
            dataIndex: "nome",
            key: "nome",
            fixed: "left",
            width: 180,
        },
        {
            title: "Turma",
            dataIndex: "turma",
            key: "turma",
            width: 100,
        },
        {
            title: "Período",
            dataIndex: "periodo",
            key: "periodo",
            width: 100,
        },
        {
            title: "Frequência",
            key: "frequencia",
            width: 120,
            align: "center",
            render: (_, aluno) => `${aluno.indicadores.frequencia}%`,
        },
        {
            title: "Simulados",
            key: "simulados",
            width: 100,
            align: "center",
            render: (_, aluno) => aluno.indicadores.simulados,
        },
        {
            title: "Redação",
            key: "redacao",
            width: 100,
            align: "center",
            render: (_, aluno) => aluno.indicadores.redacao,
        },
        {
            title: "Chance de aprovação",
            dataIndex: "probabilidade",
            key: "probabilidade",
            width: 200,
            sorter: (a, b) => a.probabilidade - b.probabilidade,
            defaultSortOrder: "ascend",
            render: (probabilidade) => {
                const { nivel, cor } = classificar(probabilidade);
                return (
                    <div className="probabilidade-cell">
                        <Progress percent={probabilidade} size="small" strokeColor={cor} />
                        <Tag color={cor}>{nivel}</Tag>
                    </div>
                );
            },
        },
        {
            title: "Ação",
            fixed: "right",
            width: 80,
            align: "center",
            render: (_, aluno) => (
                <span className="row-actions">
                    <FaChartLine
                        title="Detalhar previsão"
                        onClick={() => handleDetalhar(aluno)}
                        style={{ cursor: "pointer" }}
                    />
                </span>
            ),
        },
    ];

    return (
        <div className="container-usuarios">
            <Sidebar />
            <div className="content-usuarios">
                <h1>Previsão de Aprovação</h1>

                <Alert
                    className="previsao-alert"
                    type="warning"
                    showIcon
                    message="Modelo de demonstração"
                    description="As previsões e os indicadores (frequência, simulados e redação) são fictícios e servem apenas para validar a tela. Não use para decisões sobre os alunos."
                />

                <div className="previsao-stats">
                    <div className="stat-card">
                        <span>Vestibulandos</span>
                        <b>{resumo.total}</b>
                    </div>
                    <div className="stat-card">
                        <span>Chance média</span>
                        <b>{resumo.media}%</b>
                    </div>
                    <div className="stat-card">
                        <span>Chance alta</span>
                        <b className="verde">{resumo.alta}</b>
                    </div>
                    <div className="stat-card">
                        <span>Em risco</span>
                        <b className="vermelho">{resumo.baixa}</b>
                    </div>
                </div>

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
                        placeholder="Filtrar por chance"
                        style={{ width: "200px" }}
                        onChange={(value) => handleFilterChange("nivel", value)}
                    >
                        <Option value="Alta">Alta</Option>
                        <Option value="Média">Média</Option>
                        <Option value="Baixa">Baixa</Option>
                    </Select>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredPrevisoes}
                    rowKey="cpf"
                    loading={loading}
                    pagination={{ pageSize: 50 }}
                    bordered
                    scroll={{ x: 1000 }}
                    locale={{
                        emptyText: <Empty description="Nenhum aluno do Pré-Vestibular encontrado" />,
                    }}
                />
            </div>

            <Modal
                title={`Previsão — ${selectedAluno?.nome ?? ""}`}
                open={!!selectedAluno}
                onCancel={fecharDetalhes}
                footer={[
                    <Button key="reset" onClick={() => setSimulacao({ ...selectedAluno.indicadores })}>
                        Restaurar valores
                    </Button>,
                    <Button key="close" type="primary" onClick={fecharDetalhes}>
                        Fechar
                    </Button>,
                ]}
                width={620}
            >
                {simulacao && (
                    <div className="previsao-detalhe">
                        <div className="previsao-resultado">
                            <Progress
                                type="circle"
                                percent={resultadoSimulacao.probabilidade}
                                strokeColor={classificar(resultadoSimulacao.probabilidade).cor}
                                format={(p) => `${p}%`}
                            />
                            <div>
                                <p>Chance estimada de aprovação</p>
                                <Tag color={classificar(resultadoSimulacao.probabilidade).cor}>
                                    {classificar(resultadoSimulacao.probabilidade).nivel}
                                </Tag>
                                <p className="previsao-versao">Modelo {resultadoSimulacao.versao}</p>
                            </div>
                        </div>

                        <h4>Simular cenário</h4>
                        <div className="previsao-campo">
                            <label>Frequência (%)</label>
                            <Slider
                                min={0}
                                max={100}
                                value={simulacao.frequencia}
                                onChange={(v) => setSimulacao({ ...simulacao, frequencia: v })}
                            />
                        </div>
                        <div className="previsao-campo">
                            <label>Média nos simulados (0–100)</label>
                            <Slider
                                min={0}
                                max={100}
                                value={simulacao.simulados}
                                onChange={(v) => setSimulacao({ ...simulacao, simulados: v })}
                            />
                        </div>
                        <div className="previsao-campo">
                            <label>Nota de redação (0–1000)</label>
                            <InputNumber
                                min={0}
                                max={1000}
                                step={20}
                                value={simulacao.redacao}
                                onChange={(v) => setSimulacao({ ...simulacao, redacao: v ?? 0 })}
                            />
                        </div>
                        <div className="previsao-campo">
                            <label>Concorrência do curso pretendido</label>
                            <Select
                                value={simulacao.concorrencia}
                                style={{ width: "100%" }}
                                onChange={(v) => setSimulacao({ ...simulacao, concorrencia: v })}
                            >
                                {Object.entries(CONCORRENCIA).map(([valor, { label }]) => (
                                    <Option key={valor} value={valor}>
                                        {label}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <h4>O que mais pesa na previsão</h4>
                        <ul className="previsao-fatores">
                            {resultadoSimulacao.fatores.map(({ fator, impacto }) => (
                                <li key={fator}>
                                    <span>{fator}</span>
                                    <Tag color={impacto >= 0 ? "green" : "red"}>
                                        {impacto >= 0 ? "+" : ""}
                                        {impacto.toFixed(2)}
                                    </Tag>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Previsao;
