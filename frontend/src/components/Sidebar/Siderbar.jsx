import React from 'react'
import './Sidebar.scss'
import logo from "../../assets/logo.png"

function Siderbar() {
    return (
        <div className="sidebar">
            <img src={logo} className="logo"/>
            <nav>
                <a href="/Home">Home</a>
                <a href="/Cadastro">Cadastro</a>
                <a href="/Alunos">Alunos</a>
            </nav>
            <footer>
                <p>Desenvolvido por @Archs.</p>
            </footer>
        </div>)
}

export default Siderbar