import React, { useState } from "react";
import "../styles/home.scss";

import Sidebar from "../components/Sidebar/Siderbar";
import Turma from "../components/Turma/Turma";

function Home() {
    const todayDate = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    // Exemplo de turmas
    const turmas = [
        { id: 1, nome: "Pixinguinha", alunosAtuais: 35, alunosMax: 35, tags: ["Vestibular", "Manhã"], periodo: "Manhã" },
        { id: 2, nome: "Pixinguinha", alunosAtuais: 35, alunosMax: 35, tags: ["Vestibular", "Tarde"], periodo: "Tarde" },
        { id: 3, nome: "Pixinguinha", alunosAtuais: 35, alunosMax: 35, tags: ["Vestibular", "Noite"], periodo: "Noite" },
        { id: 4, nome: "Pixinguinha", alunosAtuais: 9, alunosMax: 35, tags: ["Técnico", "Sábado"], periodo: "Sábado" },
        { id: 5, nome: "Laudelina", alunosAtuais: 21, alunosMax: 35, tags: ["Vestibular", "Manhã"], periodo: "Manhã" },
        { id: 6, nome: "Laudelina", alunosAtuais: 16, alunosMax: 35, tags: ["Vestibular", "Tarde"], periodo: "Tarde" },
        { id: 7, nome: "Laudelina", alunosAtuais: 35, alunosMax: 35, tags: ["Técnico", "Noite"], periodo: "Noite" },
        { id: 8, nome: "Laudelina", alunosAtuais: 49, alunosMax: 35, tags: ["Concurso Público", "Sábado"], periodo: "Sábado" },
        { id: 9, nome: "Dandara", alunosAtuais: 10, alunosMax: 35, tags: ["Técnico", "Manhã"], periodo: "Manhã" },
        { id: 10, nome: "Dandara", alunosAtuais: 6, alunosMax: 35, tags: ["Técnico", "Tarde"], periodo: "Tarde" },
        { id: 11, nome: "Dandara", alunosAtuais: 24, alunosMax: 35, tags: ["Vestibular", "Noite"], periodo: "Noite" },
        { id: 12, nome: "Dandara", alunosAtuais: 0, alunosMax: 0, tags: ["Técnico", "Sábado"], periodo: "Sábado" },
    ];

    const [filtroPeriodo, setFiltroPeriodo] = useState("Todos");

    const handlePeriodoChange = (e) => {
        setFiltroPeriodo(e.target.value);
    };

    const handleTurmaClick = (id) => {
        console.log(`Redirecionando para a turma com ID: ${id}`);
    };

    // Filtrar turmas com base no período selecionado
    const turmasFiltradas = filtroPeriodo === "Todos"
        ? turmas
        : turmas.filter((turma) => turma.periodo === filtroPeriodo);

    return (
        <div className="home-container">
            <Sidebar />

            <div className="main-content">
                <header className="main-header">
                    <h1>Painel de Controle</h1>
                    <div className="user-info">
                        <span>{todayDate}</span>
                        <img src="" alt="User avatar" className="avatar" />
                    </div>
                </header>

                <div className="content">
                    <div className="stats">
                        <div className="stat-card"><b>Turmas Ativas:</b> {turmasFiltradas.length}/12</div>
                        <div className="stat-card"><b>Alunos Matriculados:</b> 
                            {turmasFiltradas.reduce((total, turma) => total + turma.alunosAtuais, 0)}
                        </div>
                    </div>

                    <div className="courses">
                        <h2>Nossas Turmas</h2>

                        <div className="filter">
                            <label htmlFor="periodo">Filtrar por Período: </label>
                            <select id="periodo" value={filtroPeriodo} onChange={handlePeriodoChange}>
                                <option value="Todos">Todos</option>
                                <option value="Manhã">Manhã</option>
                                <option value="Tarde">Tarde</option>
                                <option value="Noite">Noite</option>
                                <option value="Sábado">Sábado</option>
                            </select>
                        </div>

                        <div className="turmas-container">
                            {turmasFiltradas.map((turma) => (
                                <Turma
                                    key={turma.id}
                                    nome={turma.nome}
                                    alunosAtuais={turma.alunosAtuais}
                                    alunosMax={turma.alunosMax}
                                    tags={turma.tags}
                                    onClick={() => handleTurmaClick(turma.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
