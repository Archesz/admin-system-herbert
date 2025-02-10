import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/home.scss";
import Sidebar from "../components/Sidebar/Siderbar";
import Turma from "../components/Turma/Turma";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registrando os componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Home() {
    const todayDate = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const [turmas, setTurmas] = useState([]);
    const [filtroPeriodo, setFiltroPeriodo] = useState("Todos");

    // Buscar turmas do banco de dados
    useEffect(() => {
        axios
            .get("http://localhost:5000/alunos")  // Endereço do seu backend
            .then((response) => {
                const alunos = response.data;
                const turmas = alunos.reduce((acc, aluno) => {
                    const turma = acc.find((t) => t.nome === aluno.turma);
                    if (!turma) {
                        acc.push({
                            nome: aluno.turma,
                            alunosAtuais: 1,
                            alunosMax: 35,  // Pode ser ajustado conforme sua lógica
                            tags: [aluno.curso, aluno.periodo],
                            periodo: aluno.periodo,
                        });
                    } else {
                        turma.alunosAtuais += 1;
                    }
                    return acc;
                }, []);
                setTurmas(turmas);
            })
            .catch((error) => {
                console.error("Erro ao buscar as turmas", error);
            });
    }, []);

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
                        <div className="stat-card"><b>Turmas Ativas:</b> {turmasFiltradas.length}</div>
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
                                <option value="Matutino">Matutino</option>
                                <option value="Vespertino">Vespertino</option>
                                <option value="Noturno">Noturno</option>
                                <option value="Sábado">Sábado</option>
                            </select>
                        </div>

                        <div className="turmas-container">

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
