import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_URL
from "../services/api";

function Register() {

  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [curso, setCurso] = useState("");
  const [ano, setAno] = useState("");
  async function criarConta() {

    const resposta = await fetch(
      `${API_URL}/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          curso,
          ano
        })
      }
    );

    const dados = await resposta.json();

    if (resposta.ok) {

      alert("Conta criada");

      navigate("/");

    } else {

      alert(dados.erro);

    }

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white p-10 rounded-2xl shadow-md w-100">

        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Criar Conta
        </h1>

        <div className="flex flex-col gap-4">

          <input
            type="text"
            placeholder="Nome"
            className="border p-3 rounded-lg"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            className="border p-3 rounded-lg"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <select
            className="border p-3 rounded-lg"
            value={curso}
            onChange={(e) => setCurso(e.target.value)}
          >

            <option value="">
              Selecione o curso
            </option>

            <option value="Informática">
              Informática
            </option>

            <option value="Direito">
              Direito
            </option>

            <option value="Contabilidade">
              Contabilidade
            </option>

            <option value="Engenharia Civil">
              Engenharia Civil
            </option>

          </select>

          <input
            type="number"
            placeholder="Ano"
            className="border p-3 rounded-lg"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
          />

          <button
            onClick={criarConta}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
          >
            Criar Conta
          </button>

          <Link
            to="/"
            className="text-center text-blue-600"
          >
            Voltar ao login
          </Link>

        </div>

      </div>

    </div>

  );

}

export default Register;