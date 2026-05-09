import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ID,
    pass: process.env.APP_PASSWORD
  }
})

export const sendVerificationEmail = async (toEmail, token) => {
  const verificationLink = `${process.env.SERVER_URL}/api/auth/verify/${token}`

  await transporter.sendMail({
    from: `"AgroNet" <${process.env.GMAIL_ID}>`,
    to: toEmail,
    subject: 'Verify your AgroNet account',
    html: `
      <h2>Welcome to AgroNet</h2>
      <p>Click the link below to verify your account:</p>
      <a href="${verificationLink}" style="background:#16a34a;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">
        Verify Account
      </a>
      <p>This link expires in 24 hours.</p>
    `
  })
}

export default transporter