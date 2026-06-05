import {
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import API_URL
from "../services/api";

function SetupAdmin() {

  const navigate = useNavigate();

  const [nome, setNome] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [senha, setSenha] =
    useState("");

  async function criarAdmin() {

    try {

      const resposta =
        await fetch(
          `${API_URL}/register`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
            nome,
            email,
            senha,
            curso: "Administração",
            role: "ADMIN"
          })
          }
        );

      if (
        resposta.ok
      ) {

        alert(
          "Administrador criado"
        );

        navigate("/");

      }

    } catch (erro) {

      console.log(erro);

    }

  }

  return (

    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-xl">

        <h1 className="text-4xl font-bold text-gray-800">

          Configuração Inicial

        </h1>

        <p className="text-gray-500 mt-3">

          Crie o administrador principal da plataforma.

        </p>

        <div className="mt-8 flex flex-col gap-4">

          <input
            type="text"
            placeholder="Nome"
            className="border border-gray-200 rounded-2xl p-4"
            value={nome}
            onChange={(e) =>
              setNome(
                e.target.value
              )
            }
          />

          <input
            type="email"
            placeholder="Email"
            className="border border-gray-200 rounded-2xl p-4"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

          <input
            type="password"
            placeholder="Senha"
            className="border border-gray-200 rounded-2xl p-4"
            value={senha}
            onChange={(e) =>
              setSenha(
                e.target.value
              )
            }
          />

          <button
            onClick={
              criarAdmin
            }
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl mt-3"
          >

            Criar Administrador

          </button>

        </div>

      </div>

    </div>

  );

}

export default SetupAdmin;
