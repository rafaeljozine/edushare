import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Eye, EyeOff, Pencil, Search, Trash2 } from "lucide-react";
import API_URL from "../../services/api";

interface Recurso {
  id: number; nome: string; autor: string; curso: string; disciplina: string; descricao: string;
  visibilidade: "PUBLICO" | "PRIVADO"; status: "DISPONIVEL" | "INDISPONIVEL"; estado: string; user_id: string;
}

function MateriaisAdmin() {
  const navigate = useNavigate();
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [filtro, setFiltro] = useState("TODOS");
  const [editando, setEditando] = useState<Recurso | null>(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => { carregar(); }, []);
  async function carregar() { const resposta = await fetch(`${API_URL}/recursos`); if (resposta.ok) setRecursos(await resposta.json()); }
  function avisar(texto: string) { setMensagem(texto); setTimeout(() => setMensagem(""), 3000); }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    if (!editando) return;
    const resposta = await fetch(`${API_URL}/recursos/${editando.id}/admin`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editando) });
    if (resposta.ok) { setEditando(null); await carregar(); avisar("Material atualizado."); }
  }

  async function alternar(recurso: Recurso, campo: "visibilidade" | "status") {
    const atualizado = { ...recurso, [campo]: campo === "visibilidade" ? (recurso.visibilidade === "PUBLICO" ? "PRIVADO" : "PUBLICO") : (recurso.status === "DISPONIVEL" ? "INDISPONIVEL" : "DISPONIVEL") };
    const resposta = await fetch(`${API_URL}/recursos/${recurso.id}/admin`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(atualizado) });
    if (resposta.ok) { await carregar(); avisar("Estado do material atualizado."); }
  }

  async function remover(recurso: Recurso) {
    if (!confirm(`Eliminar permanentemente "${recurso.nome}"?`)) return;
    const resposta = await fetch(`${API_URL}/recursos/${recurso.id}`, { method: "DELETE" });
    if (resposta.ok) { await carregar(); avisar("Material eliminado."); }
  }

  const filtrados = useMemo(() => recursos.filter((r) => (filtro === "TODOS" || r.visibilidade === filtro || r.status === filtro) && `${r.nome} ${r.autor} ${r.curso} ${r.disciplina}`.toLowerCase().includes(pesquisa.toLowerCase())), [recursos, pesquisa, filtro]);

  return <div className="min-h-screen bg-slate-100">
    <header className="bg-slate-950 text-white px-6 py-5"><div className="max-w-7xl mx-auto flex items-center gap-4"><button onClick={() => navigate("/admin")} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl"><ArrowLeft /></button><div><h1 className="text-2xl font-bold">Gestão de materiais</h1><p className="text-slate-400">Conteúdo, visibilidade e disponibilidade</p></div></div></header>
    {mensagem && <div className="fixed top-5 right-5 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50">{mensagem}</div>}

    {editando && <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-5"><form onSubmit={salvar} className="bg-white rounded-3xl p-7 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-auto"><h2 className="text-2xl font-bold">Editar material</h2><div className="grid md:grid-cols-2 gap-4 mt-6">
      <input required className="border p-4 rounded-2xl" placeholder="Nome" value={editando.nome} onChange={(e) => setEditando({ ...editando, nome: e.target.value })} />
      <input required className="border p-4 rounded-2xl" placeholder="Autor" value={editando.autor} onChange={(e) => setEditando({ ...editando, autor: e.target.value })} />
      <input required className="border p-4 rounded-2xl" placeholder="Disciplina" value={editando.disciplina} onChange={(e) => setEditando({ ...editando, disciplina: e.target.value })} />
      <input required className="border p-4 rounded-2xl" placeholder="Curso" value={editando.curso} onChange={(e) => setEditando({ ...editando, curso: e.target.value })} />
      <select className="border p-4 rounded-2xl bg-white" value={editando.visibilidade} onChange={(e) => setEditando({ ...editando, visibilidade: e.target.value as Recurso["visibilidade"] })}><option value="PUBLICO">Público</option><option value="PRIVADO">Privado</option></select>
      <select className="border p-4 rounded-2xl bg-white" value={editando.status} onChange={(e) => setEditando({ ...editando, status: e.target.value as Recurso["status"] })}><option value="DISPONIVEL">Disponível</option><option value="INDISPONIVEL">Indisponível</option></select>
      <textarea className="md:col-span-2 border p-4 rounded-2xl min-h-28" placeholder="Descrição" value={editando.descricao || ""} onChange={(e) => setEditando({ ...editando, descricao: e.target.value })} />
    </div><div className="flex gap-3 mt-7"><button type="button" onClick={() => setEditando(null)} className="flex-1 border p-4 rounded-2xl">Cancelar</button><button className="flex-1 bg-blue-600 text-white p-4 rounded-2xl font-semibold">Guardar</button></div></form></div>}

    <main className="max-w-7xl mx-auto p-6">
      <section className="grid md:grid-cols-4 gap-5 my-6">
        {[["Materiais", recursos.length], ["Públicos", recursos.filter((r) => r.visibilidade === "PUBLICO").length], ["Privados", recursos.filter((r) => r.visibilidade === "PRIVADO").length], ["Indisponíveis", recursos.filter((r) => r.status === "INDISPONIVEL").length]].map(([rotulo, valor]) => <div key={String(rotulo)} className="bg-white p-6 rounded-3xl border border-slate-200"><BookOpen className="text-blue-600" /><p className="text-slate-500 mt-4">{rotulo}</p><strong className="text-4xl">{valor}</strong></div>)}
      </section>
      <section className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4"><div className="relative flex-1"><Search className="absolute left-4 top-4 text-slate-400" size={20} /><input className="w-full border p-4 pl-12 rounded-2xl" placeholder="Pesquisar materiais" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} /></div><select className="border p-4 rounded-2xl bg-white" value={filtro} onChange={(e) => setFiltro(e.target.value)}><option value="TODOS">Todos</option><option value="PUBLICO">Públicos</option><option value="PRIVADO">Privados</option><option value="DISPONIVEL">Disponíveis</option><option value="INDISPONIVEL">Indisponíveis</option></select></section>
      <section className="grid gap-4 mt-6">{filtrados.map((r) => <article key={r.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col lg:flex-row justify-between gap-5"><div><h2 className="font-bold text-xl">{r.nome}</h2><p className="text-blue-600 mt-1">{r.disciplina} · {r.curso}</p><p className="text-slate-500 mt-3 max-w-3xl">{r.descricao}</p><div className="flex gap-2 mt-4"><span className={`text-xs px-3 py-1 rounded-full ${r.visibilidade === "PUBLICO" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"}`}>{r.visibilidade}</span><span className={`text-xs px-3 py-1 rounded-full ${r.status === "DISPONIVEL" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{r.status}</span></div></div><div className="flex gap-2 shrink-0"><button onClick={() => setEditando(r)} className="p-3 bg-blue-50 text-blue-700 rounded-xl" title="Editar"><Pencil size={19} /></button><button onClick={() => alternar(r, "visibilidade")} className="p-3 bg-purple-50 text-purple-700 rounded-xl" title="Alternar visibilidade">{r.visibilidade === "PUBLICO" ? <EyeOff size={19} /> : <Eye size={19} />}</button><button onClick={() => alternar(r, "status")} className="p-3 bg-amber-50 text-amber-700 rounded-xl" title="Alternar disponibilidade"><BookOpen size={19} /></button><button onClick={() => remover(r)} className="p-3 bg-red-50 text-red-700 rounded-xl" title="Eliminar"><Trash2 size={19} /></button></div></article>)}</section>
    </main>
  </div>;
}

export default MateriaisAdmin;
