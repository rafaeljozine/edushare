import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
import API_URL from "../services/api";

function RecuperarSenha() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<"email" | "codigo">("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviarCodigo(evento: FormEvent) {
    evento.preventDefault(); setErro(""); setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/password/forgot`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const dados = await resposta.json();
      if (!resposta.ok) return setErro(dados.erro);
      setMensagem(dados.mensagem); setEtapa("codigo");
    } catch { setErro("Não foi possível contactar o servidor."); }
    finally { setCarregando(false); }
  }

  async function redefinirSenha(evento: FormEvent) {
    evento.preventDefault(); setErro("");
    if (novaSenha !== confirmarSenha) return setErro("As senhas não coincidem.");
    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/password/reset`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, codigo, novaSenha }) });
      const dados = await resposta.json();
      if (!resposta.ok) return setErro(dados.erro);
      navigate("/", { replace: true });
    } catch { setErro("Não foi possível contactar o servidor."); }
    finally { setCarregando(false); }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <form onSubmit={etapa === "email" ? enviarCodigo : redefinirSenha} className="bg-white border border-slate-200 p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600"><ArrowLeft size={18} /> Voltar ao login</Link>
        <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mt-7">{etapa === "email" ? <KeyRound /> : <MailCheck />}</div>
        <h1 className="text-3xl font-black text-slate-900 mt-5">{etapa === "email" ? "Recuperar senha" : "Confirmar código"}</h1>
        <p className="text-slate-500 mt-2">{etapa === "email" ? "Enviaremos um código de 6 dígitos para o seu e-mail." : `Código enviado para ${email}.`}</p>
        {mensagem && <div className="bg-green-50 text-green-700 border border-green-100 p-4 rounded-2xl mt-6">{mensagem}</div>}
        {erro && <div className="bg-red-50 text-red-700 border border-red-100 p-4 rounded-2xl mt-6">{erro}</div>}
        <div className="grid gap-4 mt-7">
          {etapa === "email" ? <input required type="email" placeholder="O seu e-mail" className="border border-slate-200 p-4 rounded-2xl outline-none focus:border-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} /> : <>
            <input required inputMode="numeric" pattern="\d{6}" maxLength={6} placeholder="Código de 6 dígitos" className="border border-slate-200 p-4 rounded-2xl outline-none focus:border-blue-500 tracking-[0.35em] text-center text-xl" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))} />
            <input required minLength={6} type="password" placeholder="Nova senha" className="border border-slate-200 p-4 rounded-2xl outline-none focus:border-blue-500" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
            <input required minLength={6} type="password" placeholder="Confirmar nova senha" className="border border-slate-200 p-4 rounded-2xl outline-none focus:border-blue-500" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
          </>}
        </div>
        <button disabled={carregando} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white p-4 rounded-2xl font-semibold">{carregando ? "A processar..." : etapa === "email" ? "Enviar código" : "Atualizar senha"}</button>
      </form>
    </div>
  );
}

export default RecuperarSenha;
