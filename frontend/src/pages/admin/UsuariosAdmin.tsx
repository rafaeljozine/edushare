import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Crown, Lock, Pencil, Search, Trash2, Unlock, User, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import API_URL from "../../services/api";

interface UserType {
  id: number;
  nome: string;
  email: string;
  curso: string;
  role: "USER" | "ADMIN";
  status: "ATIVO" | "BLOQUEADO";
}

function UsuariosAdmin() {
  const navigate = useNavigate();
  const userLogado = JSON.parse(localStorage.getItem("user") || "{}");
  const [users, setUsers] = useState<UserType[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [filtro, setFiltro] = useState("TODOS");
  const [editando, setEditando] = useState<UserType | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [cursos, setCursos] = useState<string[]>([]);

  useEffect(() => {
    carregarUsers();
    fetch(`${API_URL}/cursos`).then((resposta) => resposta.json()).then((dados) =>
      setCursos(dados.map((curso: { nome: string }) => curso.nome))
    );
  }, []);

  async function carregarUsers() {
    const resposta = await fetch(`${API_URL}/users`);
    const dados = await resposta.json();
    if (resposta.ok) setUsers(dados); else setErro(dados.erro);
  }

  function avisar(texto: string) {
    setMensagem(texto);
    setTimeout(() => setMensagem(""), 3000);
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    if (!editando) return;
    const resposta = await fetch(`${API_URL}/users/${editando.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editando)
    });
    const dados = await resposta.json();
    if (!resposta.ok) return setErro(dados.erro);
    setEditando(null);
    await carregarUsers();
    avisar("Utilizador atualizado com sucesso.");
  }

  async function alterarStatus(user: UserType) {
    const endpoint = user.status === "ATIVO" ? "bloquear" : "desbloquear";
    const resposta = await fetch(`${API_URL}/users/${user.id}/${endpoint}`, { method: "PUT" });
    if (resposta.ok) {
      await carregarUsers();
      avisar(user.status === "ATIVO" ? "Utilizador bloqueado." : "Utilizador desbloqueado.");
    }
  }

  async function eliminar(user: UserType) {
    if (!confirm(`Eliminar permanentemente a conta de ${user.nome} e os seus materiais?`)) return;
    const resposta = await fetch(`${API_URL}/users/${user.id}`, { method: "DELETE" });
    if (resposta.ok) {
      await carregarUsers();
      avisar("Utilizador eliminado.");
    }
  }

  const filtrados = useMemo(() => users.filter((user) =>
    (filtro === "TODOS" || user.status === filtro || user.role === filtro) &&
    `${user.nome} ${user.email} ${user.curso}`.toLowerCase().includes(pesquisa.toLowerCase())
  ), [users, pesquisa, filtro]);

  const estatisticas: Array<[string, number, LucideIcon, string]> = [
    ["Utilizadores", users.length, Users, "text-blue-600"],
    ["Administradores", users.filter((u) => u.role === "ADMIN").length, Crown, "text-purple-600"],
    ["Ativos", users.filter((u) => u.status === "ATIVO").length, Unlock, "text-green-600"],
    ["Bloqueados", users.filter((u) => u.status === "BLOQUEADO").length, Lock, "text-red-600"]
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-950 text-white px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/admin")} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl"><ArrowLeft /></button>
          <div><h1 className="text-2xl font-bold">Gestão de utilizadores</h1><p className="text-slate-400">Contas, acessos e permissões</p></div>
        </div>
      </header>

      {mensagem && <div className="fixed top-5 right-5 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50">{mensagem}</div>}
      {erro && <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50" onClick={() => setErro("")}>{erro}</div>}

      {editando && <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-5">
        <form onSubmit={salvar} className="bg-white rounded-3xl p-7 w-full max-w-lg shadow-2xl">
          <h2 className="text-2xl font-bold">Editar utilizador</h2>
          <div className="grid gap-4 mt-6">
            <input required className="border p-4 rounded-2xl" value={editando.nome} onChange={(e) => setEditando({ ...editando, nome: e.target.value })} />
            <input required type="email" className="border p-4 rounded-2xl" value={editando.email} onChange={(e) => setEditando({ ...editando, email: e.target.value })} />
            <select required className="border p-4 rounded-2xl bg-white" value={editando.curso} onChange={(e) => setEditando({ ...editando, curso: e.target.value })}>{cursos.map((curso) => <option key={curso}>{curso}</option>)}</select>
            <div className="grid grid-cols-2 gap-4">
              <select disabled={editando.id === userLogado.id} className="border p-4 rounded-2xl bg-white disabled:bg-slate-100" value={editando.role} onChange={(e) => setEditando({ ...editando, role: e.target.value as UserType["role"] })}><option value="USER">Utilizador</option><option value="ADMIN">Administrador</option></select>
              <select disabled={editando.id === userLogado.id} className="border p-4 rounded-2xl bg-white disabled:bg-slate-100" value={editando.status} onChange={(e) => setEditando({ ...editando, status: e.target.value as UserType["status"] })}><option value="ATIVO">Ativo</option><option value="BLOQUEADO">Bloqueado</option></select>
            </div>
          </div>
          <div className="flex gap-3 mt-7"><button type="button" onClick={() => setEditando(null)} className="flex-1 border p-4 rounded-2xl">Cancelar</button><button className="flex-1 bg-blue-600 text-white p-4 rounded-2xl font-semibold">Guardar</button></div>
        </form>
      </div>}

      <main className="max-w-7xl mx-auto p-6">
        <section className="grid md:grid-cols-4 gap-5 my-6">
          {estatisticas.map(([rotulo, valor, Icone, cor]) => <div key={rotulo} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200"><Icone className={cor} /><p className="text-slate-500 mt-4">{rotulo}</p><strong className="text-4xl">{valor}</strong></div>)}
        </section>

        <section className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1"><Search className="absolute left-4 top-4 text-slate-400" size={20} /><input className="w-full border p-4 pl-12 rounded-2xl" placeholder="Pesquisar por nome, e-mail ou curso" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} /></div>
          <select className="border p-4 rounded-2xl bg-white" value={filtro} onChange={(e) => setFiltro(e.target.value)}><option value="TODOS">Todos</option><option value="ADMIN">Administradores</option><option value="ATIVO">Ativos</option><option value="BLOQUEADO">Bloqueados</option></select>
        </section>

        <section className="grid gap-4 mt-6">
          {filtrados.map((user) => <article key={user.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center"><User /></div><div><div className="flex gap-2 items-center"><h2 className="font-bold text-xl">{user.nome}</h2>{user.role === "ADMIN" && <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">ADMIN</span>}</div><p className="text-slate-500">{user.email} · {user.curso}</p><span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${user.status === "ATIVO" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{user.status}</span></div></div>
            <div className="flex gap-2">
              <button onClick={() => setEditando(user)} className="p-3 bg-blue-50 text-blue-700 rounded-xl" title="Editar"><Pencil size={19} /></button>
              {user.id !== userLogado.id && <button onClick={() => alterarStatus(user)} className="p-3 bg-amber-50 text-amber-700 rounded-xl" title={user.status === "ATIVO" ? "Bloquear" : "Desbloquear"}>{user.status === "ATIVO" ? <Lock size={19} /> : <Unlock size={19} />}</button>}
              {user.id !== userLogado.id && <button onClick={() => eliminar(user)} className="p-3 bg-red-50 text-red-700 rounded-xl" title="Eliminar"><Trash2 size={19} /></button>}
            </div>
          </article>)}
        </section>
      </main>
    </div>
  );
}

export default UsuariosAdmin;
