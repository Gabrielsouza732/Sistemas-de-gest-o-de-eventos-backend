const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.ethereal.email",
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || "user@ethereal.email",
      pass: process.env.EMAIL_PASS || "password",
    },
  });
};

const sendEmail = async (to, subject, htmlContent, textContent) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "'EventFlow' <noreply@eventflow.com>",
    to: to,
    subject: subject,
    html: htmlContent,
    text: textContent,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("✅ Email enviado: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  createTransporter, // Exportar para testes
};
