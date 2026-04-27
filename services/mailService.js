import nodemailer from "nodemailer";

/**
 * Creates a fresh transporter each time sendMail is called.
 * This avoids stale SMTP credentials if the transporter was built
 * before dotenv finished loading all values.
 */
const createTransporter = () => {
  const provider = process.env.MAIL_PROVIDER || "sandbox";
  const isSandbox = provider === "sandbox";

  const host = isSandbox
    ? process.env.SANDBOX_MAIL_HOST
    : process.env.GMAIL_MAIL_HOST;

  const port = isSandbox
    ? Number(process.env.SANDBOX_MAIL_PORT)
    : Number(process.env.GMAIL_MAIL_PORT);

  const user = isSandbox
    ? process.env.SANDBOX_MAIL_USER
    : process.env.GMAIL_MAIL_USER;

  const pass = isSandbox
    ? process.env.SANDBOX_MAIL_PASS
    : process.env.GMAIL_MAIL_PASS;

  console.log(`[MailService] SMTP provider=${provider} host=${host} port=${port} user=${user}`);

  return nodemailer.createTransport({
    host,
    port,
    secure: false, // true for 465, false for 587/2525
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
};

export const sendMail = async ({ to, subject, text, html }) => {
  const fromName  = process.env.MAIL_FROM_NAME  || "App";
  const fromEmail = process.env.MAIL_FROM_EMAIL || "no-reply@example.com";

  const transporter = createTransporter();

  return transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });
};