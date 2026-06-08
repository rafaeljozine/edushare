import nodemailer from "nodemailer";

function getTransporter() {
  const { SMTP_USER, SMTP_PASS } = process.env;

  console.log("================================");
  console.log("TESTE SMTP GMAIL");
  console.log("HOST: smtp.gmail.com");
  console.log("PORT: 465");
  console.log("SECURE: true");
  console.log("SMTP_USER:", SMTP_USER);
  console.log("SMTP_PASS:", SMTP_PASS ? "EXISTE" : "VAZIO");
  console.log("================================");

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP_NOT_CONFIGURED");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
}

export async function enviarCodigoRecuperacao(
  destinatario: string,
  nome: string,
  codigo: string
) {
  const remetente =
    process.env.SMTP_FROM || process.env.SMTP_USER;

  console.log("Enviando email para:", destinatario);

  const transporter = getTransporter();

  await transporter.verify();

  console.log("SMTP conectado com sucesso");

  await transporter.sendMail({
    from: `"EduShare" <${remetente}>`,
    to: destinatario,
    subject: "Código de recuperação de senha - EduShare",
    text: `Olá, ${nome}. O seu código de recuperação é ${codigo}. O código expira em 10 minutos.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#0f172a">
        <h1 style="color:#2563eb;margin-bottom:8px">
          EduShare
        </h1>

        <p>
          Olá, <strong>${nome}</strong>.
        </p>

        <p>
          Use o código abaixo para definir uma nova senha:
        </p>

        <div
          style="
            font-size:32px;
            font-weight:700;
            letter-spacing:8px;
            background:#eff6ff;
            color:#1d4ed8;
            padding:20px;
            text-align:center;
            border-radius:14px;
          "
        >
          ${codigo}
        </div>

        <p style="color:#64748b">
          Este código expira em 10 minutos.
          Se não solicitou a recuperação,
          ignore este e-mail.
        </p>
      </div>
    `
  });

  console.log("Email enviado com sucesso");
}