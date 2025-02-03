import React, { Children, useEffect } from "react";
import api from "./services/api";

import "./styles/global.scss"

import Login from "./pages/Login";
import Main from "./pages/Main";
import Cadastro from "./pages/Cadastro";
import Alunos from "./pages/Alunos";

import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/Home" element={<Main />} />
        <Route path="/Cadastro" element={<Cadastro />} />
        <Route path="/Alunos" element={<Alunos />} />
      </Routes>
    </Router>
  );
}


export default App;