import nodemailer from 'nodemailer';

export async function sendAccountEmail(to, subject, body) {
 if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.EMAIL_FROM) {
  throw new Error('Email service is not configured');
 }
 const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT === '465',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
 });
 await transport.sendMail({from:process.env.EMAIL_FROM,to,subject,text:body});
}
