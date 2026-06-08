import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarCodigoRecuperacao(
  destinatario: string,
  nome: string,
  codigo: string
) {
  const resultado = await resend.emails.send({
    from: "EduShare <onboarding@resend.dev>",
    to: destinatario,
    subject: "Código de recuperação de senha",
    html: `
      <h2>EduShare</h2>

      <p>Olá ${nome}</p>

      <p>O seu código é:</p>

      <h1>${codigo}</h1>

      <p>O código expira em 10 minutos.</p>
    `
  });

  console.log(resultado);
}