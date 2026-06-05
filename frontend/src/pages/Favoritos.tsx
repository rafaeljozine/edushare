import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  Menu,
  Download,
  Star
} from "lucide-react";

import API_URL
from "../services/api";

interface Recurso {
  id: number;
  nome: string;
  autor: string;
  descricao: string;
  curso: string;
  disciplina: string;
  ficheiro: string;
  user_id: string;
}

function Favoritos() {

  const navigate = useNavigate();

  const [
    recursos,
    setRecursos
  ] = useState<Recurso[]>([]);

  const [
    abrirMenu,
    setAbrirMenu
  ] = useState(false);

  useEffect(() => {

    carregarFavoritos();

  }, []);

  async function carregarFavoritos() {

    try {

      const user = JSON.parse(
        localStorage.getItem(
          "user"
        ) || "{}"
      );

      const favoritosResposta =
        await fetch(
          `${API_URL}/favoritos/${user.id}`
        );

      const favoritos =
        await favoritosResposta.json();

      const recursosResposta =
        await fetch(
          `${API_URL}/recursos`
        );

      const recursosTodos =
        await recursosResposta.json();

      const ids =
        favoritos.map(
          (item: any) =>
            item.recurso_id
        );

      const filtrados =
        recursosTodos.filter(
          (recurso: Recurso) =>
            ids.includes(
              recurso.id
            )
        );

      setRecursos(
        filtrados
      );

    } catch (erro) {

      console.log(erro);

    }

  }

  function obterIconeArquivo(
    arquivo: string
  ) {

    if (!arquivo) {
      return "📁";
    }

    const extensao =
      arquivo.split(".").pop();

    if (
      extensao === "pdf"
    ) {
      return "📕";
    }

    if (
      extensao === "ppt" ||
      extensao === "pptx"
    ) {
      return "📊";
    }

    if (
      extensao === "doc" ||
      extensao === "docx"
    ) {
      return "📘";
    }

    return "📁";

  }

  return (

    <div className="min-h-screen bg-slate-100">

      <header className="bg-blue-600 shadow-lg sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-4 relative">

            <button
              onClick={() =>
                setAbrirMenu(
                  !abrirMenu
                )
              }
              className="text-white hover:bg-blue-700 p-3 rounded-xl transition"
            >

              <Menu size={28} />

            </button>

            {abrirMenu && (

              <div className="absolute top-16 left-0 bg-white shadow-2xl border border-gray-200 rounded-2xl w-64 overflow-hidden z-50">

                <button
                  onClick={() => {

                    navigate(
                      "/home"
                    );

                    setAbrirMenu(
                      false
                    );

                  }}
                  className="w-full text-left px-5 py-4 hover:bg-slate-100 transition border-b border-gray-100"
                >

                  Meu Perfil

                </button>

                <button
                  onClick={() => {

                    navigate(
                      "/instituicao"
                    );

                    setAbrirMenu(
                      false
                    );

                  }}
                  className="w-full text-left px-5 py-4 hover:bg-slate-100 transition border-b border-gray-100"
                >

                  Comunidade

                </button>

                <button
                  onClick={() => {

                    localStorage.removeItem(
                      "user"
                    );

                    navigate("/");

                  }}
                  className="w-full text-left px-5 py-4 hover:bg-red-50 text-red-500 transition"
                >

                  Logout

                </button>

              </div>

            )}

            <div>

              <h1 className="text-3xl font-bold text-white">

                EduShare

              </h1>

              <p className="text-blue-100 text-sm">

                Meus Favoritos

              </p>

            </div>

          </div>

        </div>

      </header>

      <main className="max-w-7xl mx-auto p-6">

        <section className="mb-10">

          <h2 className="text-4xl font-bold text-gray-800">

            Materiais Favoritos

          </h2>

          <p className="text-gray-500 mt-2">

            Materiais guardados da comunidade.

          </p>

        </section>

        <section className="grid gap-6">

          {recursos.map(
            (recurso) => (

              <div
                key={recurso.id}
                className="bg-white rounded-3xl p-6 shadow-md border border-gray-100"
              >

                <div className="flex justify-between items-start flex-wrap gap-5">

                  <div className="flex gap-5">

                    <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center text-4xl">

                      {
                        obterIconeArquivo(
                          recurso.ficheiro
                        )
                      }

                    </div>

                    <div>

                      <h3 className="text-2xl font-bold text-gray-800">

                        {
                          recurso.nome
                        }

                      </h3>

                      <p className="text-blue-600 mt-1">

                        {
                          recurso.disciplina
                        }

                      </p>

                      <p className="text-gray-500 mt-3 max-w-2xl">

                        {
                          recurso.descricao
                        }

                      </p>

                      <div className="flex gap-3 mt-4 flex-wrap">

                        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm">

                          {
                            recurso.curso
                          }

                        </span>

                        <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm flex items-center gap-2">

                          <Star
                            size={14}
                            fill="currentColor"
                          />

                          Favorito

                        </span>

                      </div>

                    </div>

                  </div>

                  <a
                    href={recurso.ficheiro}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition flex items-center gap-2"
                  >

                    <Download size={18} />

                    Baixar

                  </a>

                </div>

              </div>

            )
          )}

        </section>

      </main>

    </div>

  );

}

export default Favoritos;