import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  Search,
  Menu,
  Pencil,
  Trash2,
  Globe,
  Lock
} from "lucide-react";

import API_URL
from "../services/api";

interface Recurso {
  id: number;
  nome: string;
  descricao: string;
  disciplina: string;
  curso: string;
  ficheiro: string | null;
  user_id: number;

  autor: string;
  visibilidade: string;
  status: string;
}

function Home() {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [recursos, setRecursos] =
    useState<Recurso[]>([]);

  const [pesquisa, setPesquisa] =
    useState("");

  const [
    disciplinaFiltro,
    setDisciplinaFiltro
  ] = useState("TODAS");

  const [
    editandoId,
    setEditandoId
  ] = useState<number | null>(
    null
  );

  const [
    abrirMenu,
    setAbrirMenu
  ] = useState(false);

  const [
    mensagem,
    setMensagem
  ] = useState("");

  const [nome, setNome] =
    useState("");

  const [autor, setAutor] =
    useState("");

  const [disciplina,
    setDisciplina] =
    useState("");

  const [descricao,
    setDescricao] =
    useState("");

  const [curso, setCurso] =
    useState("");

  const [visibilidade,
    setVisibilidade] =
    useState("PUBLICO");

  const [arquivo, setArquivo] =
    useState<File | null>(null);

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

  async function adicionarRecurso() {

    if (
      !nome ||
      !autor ||
      !disciplina ||
      !descricao ||
      !curso ||
      !arquivo
    ) {

      mostrarMensagem(
        "Preencha todos os campos"
      );

      return;

    }

    try {

      const formData =
        new FormData();

      formData.append(
        "nome",
        nome
      );

      formData.append(
        "autor",
        autor
      );

      formData.append(
        "disciplina",
        disciplina
      );

      formData.append(
        "descricao",
        descricao
      );

      formData.append(
        "curso",
        curso
      );

      formData.append(
        "user_id",
        String(user.id)
      );

      formData.append(
        "visibilidade",
        visibilidade
      );

      formData.append(
        "status",
        "DISPONIVEL"
      );

      formData.append(
        "arquivo",
        arquivo
      );

      const resposta = await fetch(
          `${API_URL}/recursos`,
          {
            method: "POST",
            body: formData
          }
        );

        const dados = await resposta.json();

        console.log(dados);

        if (!resposta.ok) {
          throw new Error("Erro ao publicar");
        }

      limparFormulario();

      carregarRecursos();

      mostrarMensagem(
        "Material publicado"
      );

    } catch (erro) {

      console.log(erro);

    }

  }

  async function editarMaterial(
    id: number
  ) {

    try {

      await fetch(
        `${API_URL}/recursos/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            nome,
            autor,
            disciplina,
            descricao,
            curso,
            visibilidade
          })
        }
      );

      setEditandoId(null);

      limparFormulario();

      carregarRecursos();

      mostrarMensagem(
        "Material atualizado"
      );

    } catch (erro) {

      console.log(erro);

    }

  }

  async function removerMaterial(
    id: number
  ) {

    try {

      await fetch(
        `${API_URL}/recursos/${id}`,
        {
          method: "DELETE"
        }
      );

      carregarRecursos();

      mostrarMensagem(
        "Material removido"
      );

    } catch (erro) {

      console.log(erro);

    }

  }

  async function alterarVisibilidade(
    id: number,
    visibilidadeAtual: string
  ) {

    const novaVisibilidade =
      visibilidadeAtual ===
      "PUBLICO"
        ? "PRIVADO"
        : "PUBLICO";

    try {

      await fetch(
        `${API_URL}/recursos/${id}/visibilidade`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            visibilidade:
              novaVisibilidade
          })
        }
      );

      carregarRecursos();

      mostrarMensagem(
        "Visibilidade alterada"
      );

    } catch (erro) {

      console.log(erro);

    }

  }

  function limparFormulario() {

    setNome("");
    setAutor("");
    setDisciplina("");
    setDescricao("");
    setCurso("");
    setVisibilidade(
      "PUBLICO"
    );

    setArquivo(null);

  }

  function obterIconeArquivo(
    arquivo?: string | null
  ) {

    if (!arquivo) {

      return "📁";

    }

    const nome =
      arquivo.toLowerCase();

    if (
      nome.includes(".pdf")
    ) {

      return "📕";

    }

    if (
      nome.includes(".ppt") ||
      nome.includes(".pptx")
    ) {

      return "📊";

    }

    if (
      nome.includes(".doc") ||
      nome.includes(".docx")
    ) {

      return "📘";

    }

    return "📁";

  }

  const disciplinas =
    [...new Set(

      recursos
        .filter(
          (recurso) =>
            recurso.disciplina &&
            recurso.disciplina.trim() !==
            ""
        )
        .map(
          (recurso) =>
            recurso.disciplina
        )

    )];

  const meusMateriais =
  useMemo(() => {

    return recursos

      .filter(
        (recurso) =>
          recurso.user_id == user.id
          || recurso.user_id == null
      )

        .filter((recurso) => {

          if (
            disciplinaFiltro ===
            "TODAS"
          ) {

            return true;

          }

          return (
            recurso.disciplina ===
            disciplinaFiltro
          );

        })

        .filter((recurso) => {

          const texto =
            `
            ${recurso.nome}
            ${recurso.descricao}
            `
              .toLowerCase();

          return texto.includes(
            pesquisa.toLowerCase()
          );

        });

    }, [
      recursos,
      pesquisa,
      disciplinaFiltro,
      user.nome
    ]);

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

            <div>

              <h1 className="text-3xl font-bold text-white">

                EduShare

              </h1>

              <p className="text-blue-100 text-sm">

                Meus Materiais

              </p>

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

        <section className="grid md:grid-cols-3 gap-5 mb-10">

          <div className="bg-white p-6 rounded-3xl shadow-md">

            <p className="text-gray-500">

              Materiais

            </p>

            <h2 className="text-4xl font-bold text-blue-600 mt-2">

              {
                meusMateriais.length
              }

            </h2>

          </div>

          <div className="bg-white p-6 rounded-3xl shadow-md">

            <p className="text-gray-500">

              Públicos

            </p>

            <h2 className="text-4xl font-bold text-green-500 mt-2">

              {
                meusMateriais.filter(
                  (r) =>
                    r.visibilidade ===
                    "PUBLICO"
                ).length
              }

            </h2>

          </div>

          <div className="bg-white p-6 rounded-3xl shadow-md">

            <p className="text-gray-500">

              Privados

            </p>

            <h2 className="text-4xl font-bold text-gray-700 mt-2">

              {
                meusMateriais.filter(
                  (r) =>
                    r.visibilidade ===
                    "PRIVADO"
                ).length
              }

            </h2>

          </div>

        </section>

        <section className="bg-white p-8 rounded-3xl shadow-lg mb-10">

          <h2 className="text-3xl font-bold mb-6">

            {
              editandoId
                ? "Editar Material"
                : "Publicar Material"
            }

          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Nome"
              className="border p-4 rounded-2xl"
              value={nome}
              onChange={(e) =>
                setNome(
                  e.target.value
                )
              }
            />

            <input
              type="text"
              placeholder="Autor"
              className="border p-4 rounded-2xl"
              value={autor}
              onChange={(e) =>
                setAutor(
                  e.target.value
                )
              }
            />

            <input
              type="text"
              placeholder="Disciplina"
              className="border p-4 rounded-2xl"
              value={disciplina}
              onChange={(e) =>
                setDisciplina(
                  e.target.value
                )
              }
            />

            <select
              className="border p-4 rounded-2xl"
              value={curso}
              onChange={(e) =>
                setCurso(
                  e.target.value
                )
              }
            >

              <option value="">
                Curso
              </option>

              <option>
                Informática
              </option>

              <option>
                Direito
              </option>

              <option>
                Medicina
              </option>

            </select>

            <select
              className="border p-4 rounded-2xl"
              value={visibilidade}
              onChange={(e) =>
                setVisibilidade(
                  e.target.value
                )
              }
            >

              <option value="PUBLICO">
                Público
              </option>

              <option value="PRIVADO">
                Privado
              </option>

            </select>

            <label className="bg-blue-600 text-white rounded-2xl flex items-center justify-center cursor-pointer p-4">

              {
                arquivo
                  ? arquivo.name
                  : "Selecionar ficheiro"
              }

              <input
                type="file"
                className="hidden"
                onChange={(e) => {

                  if (
                    e.target.files
                  ) {

                    setArquivo(
                      e.target.files[0]
                    );

                  }

                }}
              />

            </label>

            <textarea
              placeholder="Descrição"
              className="border p-4 rounded-2xl md:col-span-2"
              value={descricao}
              onChange={(e) =>
                setDescricao(
                  e.target.value
                )
              }
            />

          </div>

          <button

            onClick={() => {

              if (
                editandoId
              ) {

                editarMaterial(
                  editandoId
                );

              } else {

                adicionarRecurso();

              }

            }}

            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl mt-6"
          >

            {
              editandoId
                ? "Salvar Alterações"
                : "Publicar"
            }

          </button>

        </section>

        <section className="bg-white p-8 rounded-3xl shadow-lg">

          <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">

            <div className="relative flex-1">

              <Search
                className="absolute left-4 top-4 text-gray-400"
                size={20}
              />

              <input
                type="text"
                placeholder="Pesquisar materiais..."
                className="w-full border rounded-2xl pl-12 pr-4 py-4"
                value={pesquisa}
                onChange={(e) =>
                  setPesquisa(
                    e.target.value
                  )
                }
              />

            </div>

            <select
              className="border rounded-2xl px-5 py-4"
              value={
                disciplinaFiltro
              }
              onChange={(e) =>
                setDisciplinaFiltro(
                  e.target.value
                )
              }
            >

              <option value="TODAS">
                Todas Disciplinas
              </option>

              {disciplinas.map(
                (disciplina) => (

                  <option
                    key={disciplina}
                    value={disciplina}
                  >

                    {disciplina}

                  </option>

                )
              )}

            </select>

          </div>

          <div className="grid gap-6">

            {meusMateriais.map(
  (recurso) => {

    console.log(
      "RECURSO COMPLETO:",
      recurso
    );

    console.log(
      "FICHEIRO:",
      recurso.ficheiro
    );

    return (

                <div
                  key={recurso.id}
                  className="bg-slate-50 border border-gray-200 rounded-3xl p-6 hover:shadow-lg transition"
                >

                  <div className="flex justify-between items-start flex-wrap gap-5">

                    <div className="flex gap-5">

                      <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-4xl">

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

                          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">

                            {
                              recurso.ficheiro
                            }

                          </span>

                          <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm">

                            {
                              recurso.status
                            }

                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="flex gap-3 flex-wrap">

                      <button

                        title="Editar"

                        onClick={() => {

                          setEditandoId(
                            recurso.id
                          );

                          setNome(
                            recurso.nome
                          );

                          setAutor(
                            recurso.autor
                          );

                          setDisciplina(
                            recurso.disciplina
                          );

                          setDescricao(
                            recurso.descricao
                          );

                          setCurso(
                            recurso.curso
                          );

                          setVisibilidade(
                            recurso.visibilidade
                          );

                        }}

                        className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-3 rounded-xl transition"
                      >

                        <Pencil size={18} />

                      </button>

                      <button

                        title={
                          recurso.visibilidade ===
                          "PUBLICO"
                            ? "Tornar privado"
                            : "Publicar"
                        }

                        onClick={() =>
                          alterarVisibilidade(
                            recurso.id,
                            recurso.visibilidade
                          )
                        }

                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-xl transition"
                      >

                        {
                          recurso.visibilidade ===
                          "PUBLICO"
                            ? (
                              <Lock size={18} />
                            )
                            : (
                              <Globe size={18} />
                            )
                        }

                      </button>

                    

                      <button

                        title="Remover"

                        onClick={() =>
                          removerMaterial(
                            recurso.id
                          )
                        }

                        className="bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-xl transition"
                      >

                        <Trash2 size={18} />

                      </button>

                    </div>

                  </div>

                  {recurso.ficheiro && (

                    <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between items-center flex-wrap gap-4">

                      <div>

                        <p className="text-gray-600">

                          Autor:
                          {" "}
                          {
                            recurso.autor
                          }

                        </p>

                      </div>


                      
                      <a
  href="https://edushare-vjma.onrender.com/uploads/1780556014959.pdf"
  target="_blank"
  rel="noopener noreferrer"
  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition"
>

  TESTE PDF

</a>

                          
                    </div>

                  )}

                </div>

              );
             })
              }
          </div>

        </section>

      </main>

    </div>

  );

}

export default Home;