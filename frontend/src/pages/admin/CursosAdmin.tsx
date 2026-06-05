import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap, Pencil, Plus, Power, Trash2 } from "lucide-react";
import API_URL from "../../services/api";

interface Curso { id: number; nome: string; descricao: string; ativo: boolean; total_materiais: number; }

function CursosAdmin() {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [editando, setEditando] = useState<Curso | null>(null);
  const [novo, setNovo] = useState({ nome: "", descricao: "" });
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => { carregar(); }, []);
  async function carregar() { const resposta = await fetch(`${API_URL}/cursos`); if (resposta.ok) setCursos(await resposta.json()); }
  function avisar(texto: string) { setMensagem(texto); setTimeout(() => setMensagem(""), 3000); }

  async function criar(evento: FormEvent) {
    evento.preventDefault(); setErro("");
    const resposta = await fetch(`${API_URL}/cursos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(novo) });
    const dados = await resposta.json();
    if (!resposta.ok) return setErro(dados.erro);
    setNovo({ nome: "", descricao: "" }); await carregar(); avisar("Curso criado e publicado na comunidade.");
  }

  async function salvar(curso: Curso) {
    setErro("");
    const resposta = await fetch(`${API_URL}/cursos/${curso.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(curso) });
    const dados = await resposta.json();
    if (!resposta.ok) return setErro(dados.erro);
    setEditando(null); await carregar(); avisar("Curso atualizado em todo o sistema.");
  }

  async function eliminar(curso: Curso) {
    if (!confirm(`Eliminar o curso "${curso.nome}"?`)) return;
    const resposta = await fetch(`${API_URL}/cursos/${curso.id}`, { method: "DELETE" });
    const dados = await resposta.json();
    if (!resposta.ok) return setErro(dados.erro);
    await carregar(); avisar("Curso eliminado.");
  }

  return <div className="min-h-screen bg-slate-100">
    <header className="bg-slate-950 text-white px-6 py-5"><div className="max-w-7xl mx-auto flex items-center gap-4"><button onClick={() => navigate("/admin")} className="p-3 bg-white/10 rounded-xl"><ArrowLeft /></button><div><h1 className="text-2xl font-bold">Gestão de cursos</h1><p className="text-slate-400">Cursos publicados na comunidade e usados nos cadastros</p></div></div></header>
    {mensagem && <div className="fixed top-5 right-5 bg-green-600 text-white p-4 px-6 rounded-2xl z-50">{mensagem}</div>}
    {erro && <div onClick={() => setErro("")} className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-600 text-white p-4 px-6 rounded-2xl z-50 cursor-pointer">{erro}</div>}
    <main className="max-w-7xl mx-auto p-6">
      <form onSubmit={criar} className="bg-white border border-slate-200 rounded-3xl p-6 grid md:grid-cols-[1fr_2fr_auto] gap-4 items-end mt-5">
        <label className="grid gap-2"><span className="font-medium">Nome do curso</span><input required value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} className="border p-4 rounded-2xl" placeholder="Ex.: Engenharia Informática" /></label>
        <label className="grid gap-2"><span className="font-medium">Descrição pública</span><input value={novo.descricao} onChange={(e) => setNovo({ ...novo, descricao: e.target.value })} className="border p-4 rounded-2xl" placeholder="Breve apresentação do curso" /></label>
        <button className="bg-blue-600 text-white p-4 rounded-2xl flex items-center gap-2 justify-center"><Plus size={19} /> Adicionar</button>
      </form>
      <section className="grid md:grid-cols-2 gap-5 mt-7">
        {cursos.map((curso) => <article key={curso.id} className="bg-white border border-slate-200 rounded-3xl p-6">
          {editando?.id === curso.id ? <div className="grid gap-3"><input className="border p-3 rounded-xl" value={editando.nome} onChange={(e) => setEditando({ ...editando, nome: e.target.value })} /><textarea className="border p-3 rounded-xl" value={editando.descricao} onChange={(e) => setEditando({ ...editando, descricao: e.target.value })} /><div className="flex gap-2"><button onClick={() => setEditando(null)} className="flex-1 border p-3 rounded-xl">Cancelar</button><button onClick={() => salvar(editando)} className="flex-1 bg-blue-600 text-white p-3 rounded-xl">Guardar</button></div></div> :
          <><div className="flex justify-between gap-4"><div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center"><GraduationCap /></div><span className={`h-fit text-xs px-3 py-1 rounded-full ${curso.ativo ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>{curso.ativo ? "VISÍVEL" : "OCULTO"}</span></div><h2 className="text-xl font-bold mt-4">{curso.nome}</h2><p className="text-slate-500 min-h-12 mt-2">{curso.descricao || "Sem descrição."}</p><p className="text-sm text-blue-600 mt-3">{curso.total_materiais} materiais públicos</p><div className="flex gap-2 mt-5"><button onClick={() => setEditando(curso)} className="p-3 bg-blue-50 text-blue-700 rounded-xl"><Pencil size={18} /></button><button onClick={() => salvar({ ...curso, ativo: !curso.ativo })} className="p-3 bg-amber-50 text-amber-700 rounded-xl"><Power size={18} /></button><button onClick={() => eliminar(curso)} className="p-3 bg-red-50 text-red-700 rounded-xl"><Trash2 size={18} /></button></div></>}
        </article>)}
      </section>
    </main>
  </div>;
}

export default CursosAdmin;
