import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from "react-router-dom";
import '../styles/login.scss';
import logo from '../assets/LogoBlack.png'

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/login", { email, password });
            localStorage.setItem("token", response.data.access_token);

            navigate("/Home");
        } catch (error) {
            alert("Usuário ou senha inválidos!");
        }
    };

    return (
        <div className='container'>
            <div className='login-container'>

                <div className='login-field'>
                    <img src={logo} alt="Logo" className='logo' />

                    <div className='form-field'>

                        <h1>Acessar conta</h1>
                        <p>Por favor, insira suas informações.</p>

                        <form onSubmit={handleSubmit}>
                            <div className='form-group'>
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor="email">Senha</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>  

                            <div className='form-row'>
                                <div className='form-group-row'>
                                    <input type="checkbox" id="remember" name="remember" />
                                    <label htmlFor="remember">Lembrar de mim</label>
                                </div> 

                                <a>Esqueci a senha</a>

                            </div>

                            <button type="submit">Acessar</button>
                        </form>

                    </div>


                </div>

                {/* Área Direita */}
                <div className='illustration'>

                </div>
            </div>
        </div>
    );
}

export default Login;
