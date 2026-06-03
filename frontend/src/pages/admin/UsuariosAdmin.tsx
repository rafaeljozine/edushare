/// src/pages/admin/UsuariosAdmin.tsx

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Search,
  Shield,
  User,
  GraduationCap,
  Lock,
  Unlock,
  Crown,
  Trash2
} from "lucide-react";

interface UserType {
  id: number;
  nome: string;
  email: string;
  curso: string;
  ano: number;
  role: string;
  status: string;
}

import API_URL
from "../../services/api";

function UsuariosAdmin() {

  const [
    users,
    setUsers
  ] = useState<UserType[]>([]);

  const [
    pesquisa,
    setPesquisa
  ] = useState("");

  const [
    filtroStatus,
    setFiltroStatus
  ] = useState("TODOS");

  const [
    mensagem,
    setMensagem
  ] = useState("");

  // NOVO: utilizador a eliminar (null = modal fechado)
  const [
    utilizadorParaEliminar,
    setUtilizadorParaEliminar
  ] = useState<UserType | null>(null);

  const userLogado =
    JSON.parse(
      localStorage.getItem(
        "user"
      ) || "{}"
    );

  useEffect(() => {

    carregarUsers();

  }, []);

  function mostrarMensagem(
    texto: string
  ) {

    setMensagem(texto);

    setTimeout(() => {

      setMensagem("");

    }, 3000);

  }

  async function carregarUsers() {

    try {

      const resposta =
        await fetch(
          `${API_URL}/users`
        );

      const dados =
        await resposta.json();

      setUsers(dados);

    } catch (erro) {

      console.log(erro);

    }

  }

  async function alterarStatus(
    id: number,
    status: string
  ) {

    try {

      const statusLimpo =
        status?.trim();

      const endpoint =
        statusLimpo === "ATIVO"
          ? "bloquear"
          : "desbloquear";

      const resposta =
        await fetch(
          `${API_URL}/users/${id}/${endpoint}`,
          {
            method: "PUT"
          }
        );

      if (resposta.ok) {

        carregarUsers();

        mostrarMensagem(
          statusLimpo === "ATIVO"
            ? "Utilizador bloqueado"
            : "Utilizador desbloqueado"
        );

      }

    } catch (erro) {

      console.log(erro);

    }

  }

  // ALTERADO: abre o modal em vez de window.confirm
  async function eliminarUtilizador(
    id: number
  ) {

    try {

      const resposta =
        await fetch(
          `${API_URL}/users/${id}`,
          {
            method: "DELETE"
          }
        );

      if (resposta.ok) {

        mostrarMensagem(
          "Utilizador eliminado"
        );

        setUtilizadorParaEliminar(null);

        carregarUsers();

      }

    } catch (erro) {

      console.log(erro);

    }

  }

  const utilizadoresFiltrados =
    useMemo(() => {

      return users

        .filter((user) => {

          if (filtroStatus === "TODOS") {

            return true;

          }

          return user.status === filtroStatus;

        })

        .filter((user) => {

          const texto =
            `
            ${user.nome}
            ${user.email}
            ${user.curso}
            `
              .toLowerCase();

          return texto.includes(
            pesquisa.toLowerCase()
          );

        });

    }, [users, pesquisa, filtroStatus]);

  const totalAdmins =
    users.filter(
      (user) => user.role === "ADMIN"
    ).length;

  const totalAtivos =
    users.filter(
      (user) => user.status === "ATIVO"
    ).length;

  const totalBloqueados =
    users.filter(
      (user) => user.status === "BLOQUEADO"
    ).length;

  return (

    <div className="min-h-screen bg-slate-100 p-8">

      {mensagem && (

        <div className="fixed top-5 right-5 bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50">

          {mensagem}

        </div>

      )}

      {/* NOVO: Modal de confirmação */}
      {utilizadorParaEliminar && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4">

            <h2 className="text-2xl font-bold text-gray-800 mb-2">

              Eliminar utilizador?

            </h2>

            <p className="text-gray-500 mb-6">

              Tens a certeza que queres eliminar <strong>{utilizadorParaEliminar.nome}</strong>? Esta ação é irreversível.

            </p>

            <div className="flex gap-3">

              <button
                onClick={() =>
                  setUtilizadorParaEliminar(null)
                }
                className="flex-1 px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
              >

                Cancelar

              </button>

              <button
                onClick={() =>
                  eliminarUtilizador(
                    utilizadorParaEliminar.id
                  )
                }
                className="flex-1 px-6 py-3 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-medium transition"
              >

                Sim, eliminar

              </button>

            </div>

          </div>

        </div>

      )}

      <div className="mb-10">

        <h1 className="text-5xl font-bold text-gray-800">

          Gestão de Utilizadores

        </h1>

        <p className="text-gray-500 mt-3 text-lg">

          Controle e moderação dos utilizadores da plataforma.

        </p>

      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition">

          <User
            size={40}
            className="text-blue-600"
          />

          <p className="text-gray-500 mt-4">

            Utilizadores

          </p>

          <h2 className="text-5xl font-bold mt-2">

            {users.length}

          </h2>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition">

          <Shield
            size={40}
            className="text-purple-600"
          />

          <p className="text-gray-500 mt-4">

            Administradores

          </p>

          <h2 className="text-5xl font-bold mt-2">

            {totalAdmins}

          </h2>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition">

          <Unlock
            size={40}
            className="text-green-600"
          />

          <p className="text-gray-500 mt-4">

            Activos

          </p>

          <h2 className="text-5xl font-bold mt-2">

            {totalAtivos}

          </h2>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition">

          <Lock
            size={40}
            className="text-red-500"
          />

          <p className="text-gray-500 mt-4">

            Bloqueados

          </p>

          <h2 className="text-5xl font-bold mt-2">

            {totalBloqueados}

          </h2>

        </div>

      </div>

      <div className="bg-white rounded-3xl shadow-md p-6 mb-8">

        <div className="grid md:grid-cols-2 gap-4">

          <div className="relative">

            <Search
              className="absolute left-4 top-4 text-gray-400"
              size={20}
            />

            <input
              type="text"
              placeholder="Pesquisar utilizador..."
              className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-blue-500"
              value={pesquisa}
              onChange={(e) =>
                setPesquisa(e.target.value)
              }
            />

          </div>

          <select
            className="border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-blue-500"
            value={filtroStatus}
            onChange={(e) =>
              setFiltroStatus(e.target.value)
            }
          >

            <option value="TODOS">

              Todos os estados

            </option>

            <option value="ATIVO">

              Activos

            </option>

            <option value="BLOQUEADO">

              Bloqueados

            </option>

          </select>

        </div>

      </div>

      <div className="grid gap-5">

        {utilizadoresFiltrados.map(
          (user) => (

            <div
              key={user.id}
              className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition"
            >

              <div className="flex justify-between items-center flex-wrap gap-5">

                <div className="flex items-center gap-5">

                  <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center">

                    <User
                      size={35}
                      className="text-blue-600"
                    />

                  </div>

                  <div>

                    <div className="flex items-center gap-3 flex-wrap">

                      <h2 className="text-2xl font-bold text-gray-800">

                        {user.nome}

                      </h2>

                      {user.role === "ADMIN" && (

                        <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm flex items-center gap-2">

                          <Crown size={14} />

                          Admin

                        </span>

                      )}

                    </div>

                    <p className="text-gray-500 mt-2">

                      {user.email}

                    </p>

                    <div className="flex gap-3 mt-4 flex-wrap">

                      {user.curso && (

                        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm flex items-center gap-2">

                          <GraduationCap size={14} />

                          {user.curso}

                        </span>

                      )}

                    </div>

                  </div>

                </div>

                <div className="flex gap-3">

                  {user.role !== "ADMIN" &&
                   user.id !== userLogado.id && (

                    <button
                      onClick={() =>
                        alterarStatus(
                          user.id,
                          user.status
                        )
                      }
                      className={`
                        px-6 py-3 rounded-2xl text-white transition font-medium shadow-md

                        ${
                          user.status === "ATIVO"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-blue-600 hover:bg-blue-700"
                        }
                      `}
                    >

                      {user.status === "ATIVO"
                        ? "Bloquear"
                        : "Desbloquear"}

                    </button>

                  )}

                  {/* ALTERADO: só aparece para não-admins e não para o próprio utilizador logado */}
                  {user.role !== "ADMIN" &&
                   user.id !== userLogado.id && (

                    <button
                      onClick={() =>
                        setUtilizadorParaEliminar(user)
                      }
                      className="
                        bg-red-700
                        hover:bg-red-800
                        text-white
                        px-5
                        py-3
                        rounded-2xl
                        shadow-md
                      "
                    >

                      Eliminar

                    </button>

                  )}

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </div>

  );

}

export default UsuariosAdmin;