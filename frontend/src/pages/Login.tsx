import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, LockKeyhole, Mail } from "lucide-react";
import API_URL from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/verificar-admin`)
      .then((resposta) => resposta.json())
      .then((dados) => !dados.existeAdmin && navigate("/setup-admin"))
      .catch(() => setErro("Não foi possível contactar o servidor."));
  }, [navigate]);

  async function fazerLogin(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    if (!email || !senha) return setErro("Preencha o e-mail e a senha.");

    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });
      const dados = await resposta.json();
      if (!resposta.ok) return setErro(dados.erro || "Não foi possível iniciar sessão.");

      localStorage.setItem("user", JSON.stringify(dados));
      navigate(dados.role === "ADMIN" ? "/admin" : "/home");
    } catch {
      setErro("Não foi possível contactar o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 grid lg:grid-cols-2">
      <section className="hidden lg:flex relative overflow-hidden p-14 text-white">
        <div className="absolute inset-0 bg-linear-to-br from-blue-700 via-blue-900 to-slate-950" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between max-w-xl">
          <div className="flex items-center gap-3 text-2xl font-bold"><div className="bg-white/15 p-3 rounded-2xl"><BookOpen /></div>EduShare</div>
          <div>
            <p className="text-blue-200 uppercase tracking-[0.3em] text-sm">Conhecimento em comunidade</p>
            <h1 className="text-6xl font-black leading-tight mt-6">Aprenda, partilhe e evolua.</h1>
            <p className="text-blue-100 text-xl leading-relaxed mt-6">Uma biblioteca académica organizada para aproximar estudantes, docentes e recursos.</p>
          </div>
           <p className="text-blue-200 text-sm">Powred By Jozine & Bobotela</p>
          <p className="text-blue-200 text-sm">Plataforma académica EduShare</p>
        </div>
      </section>

      <main className="bg-slate-50 flex items-center justify-center p-6">
        <form onSubmit={fazerLogin} className="bg-white border border-slate-200 p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 text-blue-700 text-2xl font-bold mb-8"><BookOpen /> EduShare</div>
          <p className="text-blue-600 font-semibold">Bem-vindo de volta</p>
          <h2 className="text-4xl font-black text-slate-900 mt-2">Iniciar sessão</h2>
          <p className="text-slate-500 mt-3">Aceda à sua biblioteca académica.</p>
          {erro && <div className="bg-red-50 text-red-700 border border-red-100 p-4 rounded-2xl mt-6">{erro}</div>}
          <div className="grid gap-4 mt-7">
            <label className="relative"><Mail className="absolute left-4 top-4 text-slate-400" size={20} /><input type="email" required placeholder="E-mail" className="w-full border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label className="relative"><LockKeyhole className="absolute left-4 top-4 text-slate-400" size={20} /><input type="password" required placeholder="Senha" className="w-full border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-blue-500" value={senha} onChange={(e) => setSenha(e.target.value)} /></label>
          </div>
          <div className="flex justify-end mt-4"><Link to="/recuperar-senha" className="text-blue-600 font-medium hover:text-blue-800">Esqueceu a senha?</Link></div>
          <button disabled={carregando} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white p-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">{carregando ? "A entrar..." : "Entrar"} <ArrowRight size={20} /></button>
          <p className="text-center text-slate-500 mt-7">Ainda não tem conta? <Link to="/register" className="text-blue-600 font-semibold">Criar conta</Link></p>
        </form>
      </main>
    </div>
  );
}

export default Login;
