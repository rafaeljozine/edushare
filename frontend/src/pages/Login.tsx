import {
  useState,
  useEffect
} from "react";

import {
  useNavigate,
  Link
} from "react-router-dom";

import API_URL
from "../services/api";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [senha, setSenha] =
    useState("");

  useEffect(() => {

    verificarAdmin();

  }, []);

  async function verificarAdmin() {

    try {

      const resposta =
        await fetch(
          `${API_URL}/verificar-admin`
        );

      const dados =
        await resposta.json();

      if (
        !dados.existeAdmin
      ) {

        navigate(
          "/setup-admin"
        );

      }

    } catch (erro) {

      console.log(erro);

    }

  }

  async function fazerLogin() {

    if (
      !email ||
      !senha
    ) {

      alert(
        "Preencha todos os campos"
      );

      return;

    }

    try {

      const resposta =
        await fetch(
          `${API_URL}/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              email,
              senha
            })
          }
        );

      const dados =
        await resposta.json();

        console.log(dados);

      if (
        resposta.ok
      ) {

        localStorage.setItem(
          "user",
          JSON.stringify(dados)
        );

        if (
          dados.role ===
          "ADMIN"
        ) {

          navigate(
            "/admin"
          );

        } else {

          navigate(
            "/home"
          );

        }

      } else {

        alert(
          dados.erro
        );

      }

    } catch (erro) {

      console.log(erro);

      alert(
        "Erro ao conectar ao servidor"
      );

    }

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-5">

      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">

        <div className="text-center mb-8">

          <h1 className="text-5xl font-bold text-blue-600">

            EduShare

          </h1>

          <p className="text-gray-500 mt-3 leading-relaxed">

            Plataforma académica
            colaborativa para
            partilha de recursos.

          </p>

        </div>

        <div className="flex flex-col gap-4">

          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 p-4 rounded-2xl outline-none focus:border-blue-500 transition"
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
            className="border border-gray-300 p-4 rounded-2xl outline-none focus:border-blue-500 transition"
            value={senha}
            onChange={(e) =>
              setSenha(
                e.target.value
              )
            }
          />

          <button
            onClick={fazerLogin}
            className="bg-blue-600 hover:bg-blue-700 transition text-white p-4 rounded-2xl font-medium shadow-md"
          >

            Entrar

          </button>

          <Link
            to="/register"
            className="text-center text-blue-600 hover:underline mt-2"
          >

            Criar conta

          </Link>

        </div>

      </div>

    </div>

  );

}

export default Login;