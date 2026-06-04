import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Trash2,
  Search,
  BookOpen,
  FolderOpen,
  Eye,
  User,
  GraduationCap
} from "lucide-react";

interface Recurso {
  id: number;
  nome: string;
  user_id: string;
  curso: string;
  disciplina: string;
  descricao: string;
  visibilidade: string;
}

import API_URL
from "../../services/api";

function MateriaisAdmin() {

  const [
    recursos,
    setRecursos
  ] = useState<Recurso[]>([]);

  const [
    pesquisa,
    setPesquisa
  ] = useState("");

  const [
    filtroCurso,
    setFiltroCurso
  ] = useState("TODOS");

  const [
    mensagem,
    setMensagem
  ] = useState("");

  useEffect(() => {

    carregarRecursos();

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

      const resposta =
        await fetch(
          `${API_URL}/recursos`
        );

      const dados =
        await resposta.json();

      setRecursos(dados);

    } catch (erro) {

      console.log(erro);

    }

  }

  async function remover(
    id: number
  ) {

    const confirmar =
      confirm(
        "Deseja remover este material?"
      );

    if (
      !confirmar
    ) {

      return;

    }

    try {

      const resposta =
        await fetch(
          `${API_URL}/recursos/${id}`,
          {
            method: "DELETE"
          }
        );

      if (
        resposta.ok
      ) {

        carregarRecursos();

        mostrarMensagem(
          "Material removido"
        );

      }

    } catch (erro) {

      console.log(erro);

    }

  }

  const recursosFiltrados =
    useMemo(() => {

      return recursos

        .filter((recurso) => {

          if (
            filtroCurso ===
            "TODOS"
          ) {

            return true;

          }

          return (
            recurso.curso ===
            filtroCurso
          );

        })

        .filter((recurso) => {

          const texto =
            `
            ${recurso.nome}
            ${recurso.curso}
            ${recurso.disciplina}
            ${recurso.user_id}
            `
              .toLowerCase();

          return texto.includes(
            pesquisa.toLowerCase()
          );

        });

    }, [
      recursos,
      pesquisa,
      filtroCurso
    ]);

  const cursos =
    [
      ...new Set(
        recursos.map(
          (item) =>
            item.curso
        )
      )
    ];

  const totalPublicos =
    recursos.filter(
      (item) =>
        item.visibilidade ===
        "PUBLICO"
    ).length;

  const totalPrivados =
    recursos.filter(
      (item) =>
        item.visibilidade ===
        "PRIVADO"
    ).length;

  return (

    <div className="min-h-screen bg-slate-100 p-8">

      {

        mensagem && (

          <div className="fixed top-5 right-5 bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50">

            {mensagem}

          </div>

        )

      }

      <div className="mb-10">

        <h1 className="text-5xl font-bold text-gray-800">

          Gestão de Materiais

        </h1>

        <p className="text-gray-500 mt-3 text-lg">

          Gestão e moderação dos materiais académicos.

        </p>

      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white rounded-3xl p-6 shadow-md">

          <FolderOpen
            size={40}
            className="text-blue-600"
          />

          <p className="text-gray-500 mt-4">

            Total de Materiais

          </p>

          <h2 className="text-5xl font-bold mt-2">

            {recursos.length}

          </h2>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md">

          <Eye
            size={40}
            className="text-green-600"
          />

          <p className="text-gray-500 mt-4">

            Públicos

          </p>

          <h2 className="text-5xl font-bold mt-2">

            {totalPublicos}

          </h2>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md">

          <BookOpen
            size={40}
            className="text-orange-500"
          />

          <p className="text-gray-500 mt-4">

            Privados

          </p>

          <h2 className="text-5xl font-bold mt-2">

            {totalPrivados}

          </h2>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md">

          <GraduationCap
            size={40}
            className="text-purple-600"
          />

          <p className="text-gray-500 mt-4">

            Cursos

          </p>

          <h2 className="text-5xl font-bold mt-2">

            {cursos.length}

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
              placeholder="Pesquisar material..."
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
            value={filtroCurso}
            onChange={(e) =>
              setFiltroCurso(
                e.target.value
              )
            }
          >

            <option value="TODOS">

              Todos os cursos

            </option>

            {

              cursos.map(
                (
                  curso,
                  index
                ) => (

                  <option
                    key={index}
                    value={curso}
                  >

                    {curso}

                  </option>

                )
              )

            }

          </select>

        </div>

      </div>

      <div className="grid gap-5">

        {

          recursosFiltrados.map(
            (recurso) => (

              <div
                key={recurso.id}
                className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition"
              >

                <div className="flex justify-between items-center flex-wrap gap-5">

                  <div className="flex items-center gap-5">

                    <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center">

                      <BookOpen
                        size={35}
                        className="text-blue-600"
                      />

                    </div>

                    <div>

                      <h2 className="text-2xl font-bold text-gray-800">

                        {recurso.nome}

                      </h2>

                      <div className="flex flex-wrap gap-3 mt-4">

                        {

                          recurso.curso && (

                            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm flex items-center gap-2">

                              <GraduationCap size={14} />

                              {recurso.curso}

                            </span>

                          )

                        }

                        {

                          recurso.disciplina && (

                            <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm">

                              {recurso.disciplina}

                            </span>

                          )

                        }

                        <span
                          className={`
                            px-4 py-2 rounded-full text-sm text-white

                            ${
                              recurso.visibilidade ===
                              "PUBLICO"
                                ? "bg-green-600"
                                : "bg-orange-500"
                            }
                          `}
                        >

                          {
                            recurso.visibilidade ===
                            "PUBLICO"
                              ? "Público"
                              : "Privado"
                          }

                        </span>

                      </div>

                      <div className="flex items-center gap-2 mt-4 text-gray-500">

                        <User size={16} />

                        <p>

                          Publicado por:
                          {" "}
                          <span className="font-medium text-blue-600">

                            {recurso.user_id}

                          </span>

                        </p>

                      </div>

                      {

                        recurso.descricao && (

                          <p className="text-gray-500 mt-4 leading-relaxed">

                            {recurso.descricao}

                          </p>

                        )

                      }

                    </div>

                  </div>

                  <div className="flex gap-3">

                    <button
                      onClick={() =>
                        remover(
                          recurso.id
                        )
                      }
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-4 rounded-2xl transition"
                    >

                      <Trash2 size={22} />

                    </button>

                  </div>

                </div>

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default MateriaisAdmin;