import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  Menu,
  Search,
  Star,
  Download
} from "lucide-react";

interface Recurso {
  id: number;
  nome: string;
  autor: string;
  user_id: number | null;
  disciplina: string;
  descricao: string;
  curso: string;
  ficheiro: string;
  visibilidade: string;
  status: string;
}

import API_URL
from "../services/api";

function Instituicao() {

  const navigate = useNavigate();

  const [recursos, setRecursos] =
    useState<Recurso[]>([]);

  const [pesquisa, setPesquisa] =
    useState("");

  const [
    cursoSelecionado,
    setCursoSelecionado
  ] = useState("TODOS");

  const [
    abrirMenu,
    setAbrirMenu
  ] = useState(false);

  const [
    favoritos,
    setFavoritos
  ] = useState<number[]>([]);

  const [
    mensagem,
    setMensagem
  ] = useState("");

  useEffect(() => {

    carregarRecursos();

    carregarFavoritos();

  }, []);

  function mostrarMensagem(
    texto: string
  ) {

    setMensagem(texto);

    setTimeout(() => {

      setMensagem("");

    }, 3000);

  }

  async function carregarRecursos() {

    try {

      const resposta = await fetch(
        `${API_URL}/recursos`
      );

      const dados =
        await resposta.json();

      setRecursos(dados);

    } catch (erro) {

      console.log(erro);

    }

  }

  async function carregarFavoritos() {

    try {

      const user = JSON.parse(
        localStorage.getItem(
          "user"
        ) || "{}"
      );

      const resposta =
        await fetch(
          `${API_URL}/favoritos/${user.id}`
        );

      const dados =
        await resposta.json();

      setFavoritos(

        dados.map(
          (item: any) =>
            item.recurso_id
        )

      );

    } catch (erro) {

      console.log(erro);

    }

  }

  async function toggleFavorito(
    recursoId: number
  ) {

    try {

      const user = JSON.parse(
        localStorage.getItem(
          "user"
        ) || "{}"
      );

      const resposta =
        await fetch(
          `${API_URL}/favoritos`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              user_id: user.id,
              recurso_id:
                recursoId
            })
          }
        );

      const dados =
        await resposta.json();

      if (
        dados.favorito
      ) {

        setFavoritos([
          ...favoritos,
          recursoId
        ]);

        mostrarMensagem(
          "Adicionado aos favoritos"
        );

      } else {

        setFavoritos(

          favoritos.filter(
            (id) =>
              id !== recursoId
          )

        );

        mostrarMensagem(
          "Removido dos favoritos"
        );

      }

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

  const materiaisPublicos =
    useMemo(() => {

      return recursos

        .filter(
          (recurso) =>
            recurso.visibilidade ===
            "PUBLICO"
        )

        .filter(
          (recurso) =>
            (
              recurso.status ||
              "DISPONIVEL"
            ) ===
            "DISPONIVEL"
        )

        .filter((recurso) => {

          if (
            cursoSelecionado ===
            "TODOS"
          ) {
            return true;
          }

          return (
            recurso.curso ===
            cursoSelecionado
          );

        })

        .filter((recurso) => {

          const texto =
            `
            ${recurso.nome}
            ${recurso.descricao}
            ${recurso.disciplina}
            ${recurso.autor}
            ${recurso.curso}
            `
              .toLowerCase();

          return texto.includes(
            pesquisa.toLowerCase()
          );

        });

    }, [
      recursos,
      pesquisa,
      cursoSelecionado
    ]);

  const cursos =
    [...new Set(

      recursos
        .filter(
          (recurso) =>
            recurso.curso &&
            recurso.curso.trim() !==
            ""
        )
        .map(
          (recurso) =>
            recurso.curso
        )

    )];

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
                      "/favoritos"
                    );

                    setAbrirMenu(
                      false
                    );

                  }}
                  className="w-full text-left px-5 py-4 hover:bg-slate-100 transition border-b border-gray-100"
                >

                  Meus Favoritos

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

            <div className="flex items-center gap-4">

  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-lg">

    <img
      src="/logo.jpg"
      alt="Logo"
      className="w-full h-full object-cover"
    />

  </div>

  <div>

    <h1 className="text-3xl font-bold text-white tracking-tight">

      EduShare

    </h1>

    <p className="text-blue-100 text-sm">

      Biblioteca Académica

    </p>

  </div>

</div>

          </div>

        </div>

      </header>

      {mensagem && (

        <div className="fixed top-5 right-5 bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50">

          {mensagem}

        </div>

      )}

      <main className="max-w-7xl mx-auto p-6">

        <section className="relative overflow-hidden rounded-[40px] shadow-2xl mb-10 h-130 border border-white/10">

  <img
    src="/instituicao.jpg"
    alt="Instituição"
    className="absolute inset-0 w-full h-full object-cover scale-105 blur-[2px]"
  />

  <div className="absolute inset-0 bg-black/60" />

  <div className="absolute inset-0 bg-linear-to-r from-slate-950/80 via-slate-900/50 to-slate-900/30" />

  <div className="relative z-10 h-full flex flex-col justify-between p-14 text-white">

    <div className="flex justify-between items-start flex-wrap gap-5">

      <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl">

        <span className="text-sm tracking-[0.25em] uppercase text-gray-200 font-medium">

          Biblioteca Académica

        </span>

      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl">

        <span className="text-sm text-gray-100">

          Plataforma institucional colaborativa

        </span>

      </div>

    </div>

    <div>

      <h2 className="text-6xl font-bold leading-tight tracking-tight max-w-4xl">

        Conhecimento partilhado
        para toda a comunidade académica.

      </h2>

      <p className="mt-8 text-xl text-gray-200 leading-relaxed max-w-3xl">

        Explore livros, relatórios, apresentações,
        testes, exercícios resolvidos e diversos
        materiais académicos disponibilizados
        por estudantes e docentes da instituição.

      </p>

      <div className="mt-12 flex flex-wrap gap-8 text-gray-200">

        <div className="border-l border-white/20 pl-5">

          <p className="text-sm uppercase tracking-widest text-gray-300">

            Materiais disponíveis

          </p>

          <span className="text-lg font-semibold">

            {
              materiaisPublicos.length
            }
            {" "}
            recursos publicados

          </span>

        </div>

        <div className="border-l border-white/20 pl-5">

          <p className="text-sm uppercase tracking-widest text-gray-300">

            Cursos académicos

          </p>

          <span className="text-lg font-semibold">

            {cursos.length}
            {" "}
            áreas disponíveis

          </span>

        </div>

        <div className="border-l border-white/20 pl-5">

          <p className="text-sm uppercase tracking-widest text-gray-300">

            Disponibilidade

          </p>

          <span className="text-lg font-semibold">

            Acesso contínuo à plataforma

          </span>

        </div>

      </div>

    </div>

  </div>

</section>

        <section className="bg-white rounded-3xl shadow-lg p-6 mb-10">

          <div className="grid md:grid-cols-2 gap-4">

            <div className="relative">

              <Search
                className="absolute left-4 top-4 text-gray-400"
                size={20}
              />

              <input
                type="text"
                placeholder="Pesquisar materiais..."
                className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-blue-500"
                value={pesquisa}
                onChange={(e) =>
                  setPesquisa(
                    e.target.value
                  )
                }
              />

            </div>

            <select
              className="border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-blue-500"
              value={
                cursoSelecionado
              }
              onChange={(e) =>
                setCursoSelecionado(
                  e.target.value
                )
              }
            >

              <option value="TODOS">

                Todos os cursos

              </option>

              {cursos.map(
                (curso) => (

                  <option
                    key={curso}
                    value={curso}
                  >

                    {curso}

                  </option>

                )
              )}

            </select>

          </div>

        </section>

        <section>

          <div className="flex justify-between items-center mb-8">

            <div>

              <h2 className="text-3xl font-bold text-gray-800">

                Materiais Disponíveis

              </h2>

              <p className="text-gray-500 mt-1">

                {
                  materiaisPublicos.length
                }
                {" "}
                materiais encontrados

              </p>

            </div>

          </div>

          <div className="grid gap-6">

            {materiaisPublicos.map(
              (recurso) => (

                <div
                  key={recurso.id}
                  className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >

                  <div className="flex justify-between items-start gap-6 flex-wrap">

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

                        <p className="text-blue-600 font-medium mt-1">

                          {
                            recurso.disciplina
                          }

                        </p>

                        <p className="text-gray-500 mt-3 leading-relaxed max-w-2xl">

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

                          <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm">

                            {
                              recurso.autor
                            }

                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="flex gap-3">

                    {

                        recurso.user_id !==
                        JSON.parse(
                        localStorage.getItem(
                            "user"
                        ) || "{}"
                        ).id

                        ? (

                        <>

                            <button

                            onClick={() =>
                                toggleFavorito(
                                recurso.id
                                )
                            }

                            className={`
                                p-3 rounded-xl transition

                                ${
                                favoritos.includes(
                                    recurso.id
                                )
                                    ? "bg-yellow-100 text-yellow-600"
                                    : "bg-gray-100 text-gray-600 hover:bg-yellow-50"
                                }
                            `}
                            >

                            <Star
                                size={18}
                                fill={
                                favoritos.includes(
                                    recurso.id
                                )
                                    ? "currentColor"
                                    : "none"
                                }
                            />

                            </button>
                                console.log(recurso);
                            <a
                              href={`${API_URL}/uploads/${recurso.ficheiro}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="
                                bg-blue-600
                                text-white
                                px-5
                                py-3
                                rounded-2xl
                                flex
                                items-center
                                gap-2
                                hover:bg-blue-700
                              "
                            >
                              <Download size={18} />
                              {recurso.ficheiro}
                            </a>

                        </>

                        )

                        : (

                        <div className="bg-blue-50 text-blue-700 px-5 py-3 rounded-2xl text-sm font-medium">

                            Publicado por você

                        </div>

                        )

                    }

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

      </main>

    </div>

  );

}

export default Instituicao;