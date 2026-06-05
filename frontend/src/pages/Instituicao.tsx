import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Download, GraduationCap, Menu, MessageCircle, Search, Send, Star, Trash2 } from "lucide-react";
import API_URL from "../services/api";
import MaterialPreview from "../components/MaterialPreview";

interface Recurso {
  id: number; nome: string; autor: string; user_id: number; disciplina: string; descricao: string;
  curso: string; ficheiro: string | null; visibilidade: string; status: string; created_at: string; downloads: number;
}
interface Curso { id: number; nome: string; descricao: string; ativo: boolean; total_materiais: number; }
interface Comentario { id: number; texto: string; created_at: string; user_id: number; nome: string; }

function Instituicao() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [comentarios, setComentarios] = useState<Record<number, Comentario[]>>({});
  const [comentariosAbertos, setComentariosAbertos] = useState<number[]>([]);
  const [novoComentario, setNovoComentario] = useState<Record<number, string>>({});
  const [pesquisa, setPesquisa] = useState("");
  const [cursoSelecionado, setCursoSelecionado] = useState("TODOS");
  const [abrirMenu, setAbrirMenu] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => { carregarTudo(); }, []);

  async function carregarTudo() {
    const [recursosRes, cursosRes, favoritosRes] = await Promise.all([
      fetch(`${API_URL}/recursos`), fetch(`${API_URL}/cursos`), fetch(`${API_URL}/favoritos/${user.id}`)
    ]);
    if (recursosRes.ok) setRecursos(await recursosRes.json());
    if (cursosRes.ok) setCursos((await cursosRes.json()).filter((curso: Curso) => curso.ativo));
    if (favoritosRes.ok) setFavoritos((await favoritosRes.json()).map((item: { recurso_id: number }) => item.recurso_id));
  }

  function avisar(texto: string) { setMensagem(texto); setTimeout(() => setMensagem(""), 3000); }

  async function toggleFavorito(recurso: Recurso) {
    if (String(recurso.user_id) === String(user.id)) return avisar("O seu próprio material não pode ser favoritado.");
    const resposta = await fetch(`${API_URL}/favoritos`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, recurso_id: recurso.id })
    });
    const dados = await resposta.json();
    if (!resposta.ok) return avisar(dados.erro);
    setFavoritos((atuais) => dados.favorito ? [...atuais, recurso.id] : atuais.filter((id) => id !== recurso.id));
  }

  async function baixar(recurso: Recurso) {
    await fetch(`${API_URL}/recursos/${recurso.id}/download`, { method: "PUT" });
    window.open(`${API_URL}/uploads/${recurso.ficheiro}`, "_blank");
    carregarTudo();
  }

  async function abrirComentarios(recursoId: number) {
    if (comentariosAbertos.includes(recursoId)) {
      setComentariosAbertos((atuais) => atuais.filter((id) => id !== recursoId));
      return;
    }
    const resposta = await fetch(`${API_URL}/recursos/${recursoId}/comentarios`);
    if (resposta.ok) {
      const dados = await resposta.json();
      setComentarios((atuais) => ({ ...atuais, [recursoId]: dados }));
    }
    setComentariosAbertos((atuais) => [...atuais, recursoId]);
  }

  async function comentar(evento: FormEvent, recursoId: number) {
    evento.preventDefault();
    const texto = novoComentario[recursoId]?.trim();
    if (!texto) return;
    const resposta = await fetch(`${API_URL}/recursos/${recursoId}/comentarios`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, texto })
    });
    if (resposta.ok) {
      setNovoComentario((atuais) => ({ ...atuais, [recursoId]: "" }));
      const lista = await fetch(`${API_URL}/recursos/${recursoId}/comentarios`);
      const dados = await lista.json();
      setComentarios((atuais) => ({ ...atuais, [recursoId]: dados }));
    }
  }

  async function eliminarComentario(recursoId: number, comentarioId: number) {
    const resposta = await fetch(`${API_URL}/comentarios/${comentarioId}`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, is_admin: user.role === "ADMIN" })
    });
    if (resposta.ok) setComentarios((atuais) => ({ ...atuais, [recursoId]: atuais[recursoId].filter((c) => c.id !== comentarioId) }));
  }

  const materiais = useMemo(() => recursos.filter((recurso) =>
    recurso.visibilidade === "PUBLICO" && (recurso.status || "DISPONIVEL") === "DISPONIVEL" &&
    (cursoSelecionado === "TODOS" || recurso.curso === cursoSelecionado) &&
    `${recurso.nome} ${recurso.descricao} ${recurso.disciplina} ${recurso.autor} ${recurso.curso}`.toLowerCase().includes(pesquisa.toLowerCase())
  ), [recursos, pesquisa, cursoSelecionado]);

  return <div className="min-h-screen bg-slate-100">
    <header className="bg-slate-950 text-white sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4 relative">
        <button onClick={() => setAbrirMenu(!abrirMenu)} className="p-3 bg-white/10 rounded-xl"><Menu /></button>
        {abrirMenu && <div className="absolute top-18 left-6 bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden w-56"><button onClick={() => navigate("/home")} className="w-full text-left p-4 hover:bg-slate-100">Meu perfil</button><button onClick={() => navigate("/favoritos")} className="w-full text-left p-4 hover:bg-slate-100">Meus favoritos</button><button onClick={() => { localStorage.clear(); navigate("/"); }} className="w-full text-left p-4 text-red-600 hover:bg-red-50">Sair</button></div>}
        <div><h1 className="text-2xl font-bold">EduShare Comunidade</h1><p className="text-slate-400 text-sm">Conhecimento partilhado por toda a instituição</p></div>
      </div>
    </header>
    {mensagem && <div className="fixed top-5 right-5 bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50">{mensagem}</div>}

    <main className="max-w-7xl mx-auto p-6">
      <section className="bg-linear-to-br from-blue-700 to-slate-950 text-white rounded-[36px] p-9 md:p-12 mt-4">
        <p className="text-blue-200 uppercase tracking-[0.25em] text-sm">Biblioteca académica</p>
        <h2 className="text-4xl md:text-6xl font-black max-w-4xl mt-5">Materiais, ideias e experiências num só lugar.</h2>
        <div className="grid sm:grid-cols-3 gap-4 mt-10"><div className="bg-white/10 p-5 rounded-2xl"><strong className="text-3xl">{materiais.length}</strong><p className="text-blue-200">materiais disponíveis</p></div><div className="bg-white/10 p-5 rounded-2xl"><strong className="text-3xl">{cursos.length}</strong><p className="text-blue-200">cursos ativos</p></div><div className="bg-white/10 p-5 rounded-2xl"><strong className="text-3xl">{favoritos.length}</strong><p className="text-blue-200">favoritos</p></div></div>
      </section>

      <section className="mt-10"><div className="flex items-end justify-between mb-5"><div><h2 className="text-3xl font-bold">Cursos da comunidade</h2><p className="text-slate-500 mt-1">Criados e organizados pela administração.</p></div></div><div className="grid md:grid-cols-3 gap-4">{cursos.map((curso) => <button key={curso.id} onClick={() => setCursoSelecionado(curso.nome)} className="text-left bg-white border border-slate-200 p-6 rounded-3xl hover:border-blue-400 hover:shadow-lg transition"><GraduationCap className="text-blue-600" /><h3 className="font-bold text-xl mt-4">{curso.nome}</h3><p className="text-slate-500 mt-2 min-h-12">{curso.descricao || "Materiais académicos deste curso."}</p><span className="inline-block mt-4 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{curso.total_materiais} materiais</span></button>)}</div></section>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 my-10 grid md:grid-cols-2 gap-4"><div className="relative"><Search className="absolute left-4 top-4 text-slate-400" size={20} /><input value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} placeholder="Pesquisar materiais..." className="w-full border border-slate-200 rounded-2xl p-4 pl-12" /></div><select value={cursoSelecionado} onChange={(e) => setCursoSelecionado(e.target.value)} className="border border-slate-200 rounded-2xl p-4 bg-white"><option value="TODOS">Todos os cursos</option>{cursos.map((curso) => <option key={curso.id}>{curso.nome}</option>)}</select></section>

      <section><div className="mb-6"><h2 className="text-3xl font-bold">Materiais disponíveis</h2><p className="text-slate-500">{materiais.length} resultados encontrados</p></div><div className="grid lg:grid-cols-2 gap-6">
        {materiais.map((recurso) => <article key={recurso.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <MaterialPreview ficheiro={recurso.ficheiro} nome={recurso.nome} />
          <div className="mt-5"><div className="flex justify-between gap-4"><div><h3 className="text-2xl font-bold">{recurso.nome}</h3><p className="text-blue-600 font-medium">{recurso.disciplina} · {recurso.curso}</p></div>{String(recurso.user_id) !== String(user.id) && <button onClick={() => toggleFavorito(recurso)} className={`p-3 rounded-xl h-fit ${favoritos.includes(recurso.id) ? "bg-yellow-100 text-yellow-600" : "bg-slate-100 text-slate-500"}`}><Star fill={favoritos.includes(recurso.id) ? "currentColor" : "none"} size={20} /></button>}</div>
          <p className="text-slate-500 mt-4">{recurso.descricao}</p><p className="text-sm text-slate-400 mt-3">Por {recurso.autor} · {recurso.downloads || 0} downloads</p>
          <div className="flex gap-3 mt-5"><button onClick={() => baixar(recurso)} className="flex-1 bg-blue-600 text-white p-3 rounded-xl flex items-center justify-center gap-2"><Download size={18} /> Baixar</button><button onClick={() => abrirComentarios(recurso.id)} className="flex-1 bg-slate-100 text-slate-700 p-3 rounded-xl flex items-center justify-center gap-2"><MessageCircle size={18} /> Comentários</button></div></div>
          {comentariosAbertos.includes(recurso.id) && <div className="border-t border-slate-200 mt-6 pt-5"><div className="grid gap-3 max-h-64 overflow-auto">{(comentarios[recurso.id] || []).map((comentario) => <div key={comentario.id} className="bg-slate-50 p-4 rounded-2xl flex justify-between gap-3"><div><p className="font-semibold">{comentario.nome}</p><p className="text-slate-600 mt-1">{comentario.texto}</p></div>{(comentario.user_id === user.id || user.role === "ADMIN") && <button onClick={() => eliminarComentario(recurso.id, comentario.id)} className="text-red-500 h-fit"><Trash2 size={16} /></button>}</div>)}</div><form onSubmit={(e) => comentar(e, recurso.id)} className="flex gap-2 mt-4"><input maxLength={1000} value={novoComentario[recurso.id] || ""} onChange={(e) => setNovoComentario((atuais) => ({ ...atuais, [recurso.id]: e.target.value }))} placeholder="Deixe um comentário..." className="flex-1 border border-slate-200 p-3 rounded-xl" /><button className="bg-blue-600 text-white p-3 rounded-xl"><Send size={18} /></button></form></div>}
        </article>)}
        {materiais.length === 0 && <div className="lg:col-span-2 bg-white rounded-3xl p-12 text-center"><BookOpen className="mx-auto text-slate-400" size={42} /><h3 className="text-2xl font-bold mt-4">Nenhum material encontrado</h3></div>}
      </div></section>
    </main>
  </div>;
}

export default Instituicao;
