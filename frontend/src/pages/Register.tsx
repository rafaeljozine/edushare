import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import API_URL from "../services/api";

interface Curso { nome: string; ativo: boolean; }

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmarSenha: "", curso: "" });
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const atualizar = (campo: keyof typeof form, valor: string) => setForm((atual) => ({ ...atual, [campo]: valor }));

  useEffect(() => { fetch(`${API_URL}/cursos`).then((r) => r.json()).then(setCursos); }, []);

  async function criarConta(evento: FormEvent) {
    evento.preventDefault(); setErro("");
    if (form.senha !== form.confirmarSenha) return setErro("As senhas não coincidem.");
    if (form.senha.length < 6) return setErro("A senha deve ter pelo menos 6 caracteres.");
    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome: form.nome, email: form.email, senha: form.senha, curso: form.curso }) });
      const dados = await resposta.json();
      if (!resposta.ok) return setErro(dados.erro || "Não foi possível criar a conta.");
      navigate("/", { replace: true });
    } catch { setErro("Não foi possível contactar o servidor."); }
    finally { setCarregando(false); }
  }

  return <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
    <form onSubmit={criarConta} className="bg-white border border-slate-200 p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-xl">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600"><ArrowLeft size={18} /> Voltar ao login</Link>
      <div className="mt-7"><div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center"><UserPlus /></div><h1 className="text-4xl font-black mt-5">Criar conta</h1><p className="text-slate-500 mt-2">Use um e-mail válido e selecione o seu curso.</p></div>
      {erro && <div className="bg-red-50 text-red-700 p-4 rounded-2xl mt-6">{erro}</div>}
      <div className="grid md:grid-cols-2 gap-4 mt-7">
        <input required placeholder="Nome do utilizador" className="md:col-span-2 border p-4 rounded-2xl" value={form.nome} onChange={(e) => atualizar("nome", e.target.value)} />
        <input required type="email" placeholder="E-mail válido" className="md:col-span-2 border p-4 rounded-2xl" value={form.email} onChange={(e) => atualizar("email", e.target.value)} />
        <select required className="md:col-span-2 border p-4 rounded-2xl bg-white" value={form.curso} onChange={(e) => atualizar("curso", e.target.value)}><option value="">Selecione o curso</option>{cursos.filter((c) => c.ativo).map((c) => <option key={c.nome}>{c.nome}</option>)}</select>
        <input required minLength={6} type="password" placeholder="Senha" className="border p-4 rounded-2xl" value={form.senha} onChange={(e) => atualizar("senha", e.target.value)} />
        <input required minLength={6} type="password" placeholder="Confirmar senha" className="border p-4 rounded-2xl" value={form.confirmarSenha} onChange={(e) => atualizar("confirmarSenha", e.target.value)} />
      </div>
      <button disabled={carregando} className="w-full mt-7 bg-blue-600 text-white p-4 rounded-2xl font-semibold">{carregando ? "A criar conta..." : "Criar conta"}</button>
    </form>
  </div>;
}

export default Register;
