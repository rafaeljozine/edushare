import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";
import API_URL
from "../../services/api";

import {
  Users,
  BookOpen,
  Shield,
  FolderOpen
} from "lucide-react";



function DashboardAdmin() {

  const navigate = useNavigate();

  const [
    totalUsers,
    setTotalUsers
  ] = useState(0);

  const [
    totalMateriais,
    setTotalMateriais
  ] = useState(0);

  const [
    totalAdmins,
    setTotalAdmins
  ] = useState(0);

  const [
    materiaisPublicos,
    setMateriaisPublicos
  ] = useState(0);

  const [
    cursos,
    setCursos
  ] = useState<any[]>([]);

  useEffect(() => {

    carregarDados();

  }, []);

  async function carregarDados() {

    try {

      const users =
        await fetch(
          `${API_URL}/users`
        );

      const usersData =
        await users.json();

      setTotalUsers(
        usersData.length
      );

      const admins =
        usersData.filter(
          (user: any) =>
            user.role ===
            "ADMIN"
        );

      setTotalAdmins(
        admins.length
      );

      const materiais =
        await fetch(
          `${API_URL}/recursos`
        );

      const materiaisData =
        await materiais.json();

      setTotalMateriais(
        materiaisData.length
      );

      const publicos =
        materiaisData.filter(
          (item: any) =>
            item.visibilidade ===
            "PUBLICO"
        );

      setMateriaisPublicos(
        publicos.length
      );

      const cursosMap =
        materiaisData.reduce(
          (
            acc: any,
            item: any
          ) => {

            acc[item.curso] =
              (
                acc[item.curso] || 0
              ) + 1;

            return acc;

          },
          {}
        );

      setCursos(
        Object.entries(
          cursosMap
        )
      );

    } catch (erro) {

      console.log(erro);

    }

  }

  return (

    <div className="min-h-screen bg-slate-100">

      <header className="bg-blue-600 text-white px-8 py-5 shadow-lg">

        <div className="flex justify-between items-center">

          <div>

            <h1 className="text-4xl font-bold">

              Painel Administrativo

            </h1>

            <p className="text-blue-100 mt-2">

              Gestão da plataforma EduShare

            </p>

          </div>

          <button
            onClick={() => {

              localStorage.clear();

              navigate("/");

            }}
            className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-2xl transition"
          >

            Logout

          </button>

        </div>

      </header>

      <main className="max-w-7xl mx-auto p-8">

        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition">

            <Users
              size={40}
              className="text-blue-600"
            />

            <p className="text-gray-500 mt-5">

              Utilizadores

            </p>

            <h2 className="text-5xl font-bold mt-2 text-gray-800">

              {totalUsers}

            </h2>

          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition">

            <BookOpen
              size={40}
              className="text-green-600"
            />

            <p className="text-gray-500 mt-5">

              Materiais

            </p>

            <h2 className="text-5xl font-bold mt-2 text-gray-800">

              {totalMateriais}

            </h2>

          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition">

            <Shield
              size={40}
              className="text-purple-600"
            />

            <p className="text-gray-500 mt-5">

              Administradores

            </p>

            <h2 className="text-5xl font-bold mt-2 text-gray-800">

              {totalAdmins}

            </h2>

          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition">

            <BookOpen
              size={40}
              className="text-orange-500"
            />

            <p className="text-gray-500 mt-5">

              Materiais Públicos

            </p>

            <h2 className="text-5xl font-bold mt-2 text-gray-800">

              {materiaisPublicos}

            </h2>

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-10">

          <button
            onClick={() =>
              navigate(
                "/admin/usuarios"
              )
            }
            className="bg-white rounded-3xl p-8 shadow-md text-left hover:shadow-xl transition"
          >

            <Users
              size={50}
              className="text-blue-600"
            />

            <h2 className="text-3xl font-bold mt-6 text-gray-800">

              Utilizadores

            </h2>

            <p className="text-gray-500 mt-3">

              Gerir contas da plataforma.

            </p>

          </button>

          <button
            onClick={() =>
              navigate(
                "/admin/materiais"
              )
            }
            className="bg-white rounded-3xl p-8 shadow-md text-left hover:shadow-xl transition"
          >

            <FolderOpen
              size={50}
              className="text-green-600"
            />

            <h2 className="text-3xl font-bold mt-6 text-gray-800">

              Materiais

            </h2>

            <p className="text-gray-500 mt-3">

              Gerir materiais publicados.

            </p>

          </button>

        </div>

        <div className="bg-white rounded-3xl shadow-md p-8 mt-10">

          <div className="flex justify-between items-center mb-8">

            <div>

              <h2 className="text-3xl font-bold text-gray-800">

                Cursos Mais Ativos

              </h2>

              <p className="text-gray-500 mt-2">

                Cursos com maior quantidade de materiais publicados.

              </p>

            </div>

          </div>

          <div className="grid gap-5">

            {cursos.map(
              (
                curso: any,
                index
              ) => (

                <div
                  key={index}
                  className="flex justify-between items-center bg-slate-50 rounded-2xl p-5 hover:bg-slate-100 transition"
                >

                  <div>

                    <h3 className="text-xl font-semibold text-gray-800">

                      {curso[0]}

                    </h3>

                  </div>

                  <span className="bg-blue-600 text-white px-5 py-2 rounded-xl font-medium">

                    {curso[1]}
                    {" "}
                    materiais

                  </span>

                </div>

              )
            )}

          </div>

        </div>

      </main>

    </div>

  );

}

export default DashboardAdmin;