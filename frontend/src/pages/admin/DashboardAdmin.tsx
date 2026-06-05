import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, FolderOpen, GraduationCap, LogOut, Shield, Users } from "lucide-react";
import API_URL from "../../services/api";

interface User { role: string; status: string; }
interface Recurso { visibilidade: string; status: string; }
interface Curso { ativo: boolean; }

function DashboardAdmin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);

  useEffect(() => {
    Promise.all([fetch(`${API_URL}/users`), fetch(`${API_URL}/recursos`), fetch(`${API_URL}/cursos`)])
      .then(async ([u, r, c]) => { setUsers(await u.json()); setRecursos(await r.json()); setCursos(await c.json()); });
  }, []);

  const cards = [
    ["Utilizadores", users.length, Users, "text-blue-600"],
    ["Materiais", recursos.length, BookOpen, "text-green-600"],
    ["Administradores", users.filter((u) => u.role === "ADMIN").length, Shield, "text-purple-600"],
    ["Cursos ativos", cursos.filter((c) => c.ativo).length, GraduationCap, "text-orange-600"]
  ] as const;

  const areas = [
    ["Utilizadores", "Gerir contas, acessos, bloqueios e administradores.", Users, "/admin/usuarios", "bg-blue-600"],
    ["Materiais", "Moderar, editar, ocultar e eliminar conteúdos.", FolderOpen, "/admin/materiais", "bg-green-600"],
    ["Cursos", "Adicionar os cursos visíveis na comunidade e nos cadastros.", GraduationCap, "/admin/cursos", "bg-purple-600"]
  ] as const;

  return <div className="min-h-screen bg-slate-100">
    <header className="bg-slate-950 text-white px-6 py-7"><div className="max-w-7xl mx-auto flex justify-between items-center"><div><p className="text-blue-400 font-semibold">EduShare</p><h1 className="text-4xl font-black mt-1">Administração</h1><p className="text-slate-400 mt-2">Controlo central da plataforma</p></div><button onClick={() => { localStorage.clear(); navigate("/"); }} className="bg-white/10 hover:bg-red-600 p-4 rounded-2xl flex items-center gap-2"><LogOut size={19} /> Sair</button></div></header>
    <main className="max-w-7xl mx-auto p-6">
      <section className="grid md:grid-cols-4 gap-5 mt-5">{cards.map(([nome, valor, Icone, cor]) => <div key={nome} className="bg-white border border-slate-200 p-6 rounded-3xl"><Icone className={cor} /><p className="text-slate-500 mt-4">{nome}</p><strong className="text-4xl">{valor}</strong></div>)}</section>
      <section className="grid md:grid-cols-3 gap-6 mt-10">{areas.map(([nome, texto, Icone, rota, cor]) => <button key={nome} onClick={() => navigate(rota)} className="bg-white border border-slate-200 p-7 rounded-3xl text-left hover:shadow-xl hover:-translate-y-1 transition"><div className={`${cor} text-white w-14 h-14 rounded-2xl flex items-center justify-center`}><Icone /></div><h2 className="text-2xl font-bold mt-6">{nome}</h2><p className="text-slate-500 mt-2">{texto}</p></button>)}</section>
      <section className="bg-white border border-slate-200 rounded-3xl p-7 mt-10"><h2 className="text-2xl font-bold">Resumo operacional</h2><div className="grid md:grid-cols-3 gap-4 mt-5"><div className="bg-green-50 text-green-800 p-5 rounded-2xl"><strong>{users.filter((u) => u.status === "ATIVO").length}</strong><p>utilizadores ativos</p></div><div className="bg-blue-50 text-blue-800 p-5 rounded-2xl"><strong>{recursos.filter((r) => r.visibilidade === "PUBLICO").length}</strong><p>materiais públicos</p></div><div className="bg-amber-50 text-amber-800 p-5 rounded-2xl"><strong>{recursos.filter((r) => r.status === "INDISPONIVEL").length}</strong><p>materiais indisponíveis</p></div></div></section>
    </main>
  </div>;
}

export default DashboardAdmin;
