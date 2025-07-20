import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // contoh: smtp.gmail.com
  port: Number(process.env.SMTP_PORT), // 465 (SSL) atau 587 (TLS)
  secure: process.env.SMTP_SECURE === "true", // true untuk port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendLoginCode = async (to: string, name: string, code: string) => {
  await transporter.sendMail({
    from: `"No Reply" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your Login Code",
    html: `<p>Hi ${name},</p><p>Your login code is: <strong>${code}</strong>. It expires in 5 minutes.</p>`,
  });
};
