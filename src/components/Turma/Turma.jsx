import React from "react";
import "./Turma.scss";

function Turma({ nome, alunosAtuais, alunosMax, tags, onClick }) {
    const lotacaoPercent = (alunosAtuais / alunosMax) * 100;

    return (
        <div className="turma-card" onClick={onClick}>
            <div className="turma-header">
                <h3>{nome}</h3>
                <div className="tags">
                    {tags.map((tag, index) => (
                        <span key={index} className="tag">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
            <div className="turma-body">
                <div className="progress-bar">
                    <div
                        className="progress"
                        style={{ width: `${lotacaoPercent}%` }}
                    ></div>
                </div>
                <p>
                    {alunosAtuais}/{alunosMax} alunos
                </p>
            </div>
        </div>
    );
}

export default Turma;
