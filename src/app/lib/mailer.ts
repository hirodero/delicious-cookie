import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

if (process.env.NODE_ENV !== "production") {
  transporter.verify((err, success) => {
    if (err) {
      console.error("⚠️ SMTP connection failed:", err)
    } else {
      console.log("✅ SMTP connected and ready to send mail.")
    }
  })
}

export async function sendResetEmail(to: string, url: string, expireMinutes: number) {
  const html = `
    <div style="font-family: Arial, sans-serif; background:#111; color:#eee; padding:20px; border-radius:10px;">
      <h2 style="color:#ffcc00;">Password Reset Request</h2>
      <p>You requested to reset your password. Click the button below to continue:</p>
      <a href="${url}" 
         style="display:inline-block; margin-top:10px; background:linear-gradient(90deg,#facc15,#f87171);
         color:#000; padding:12px 20px; border-radius:8px; font-weight:bold; text-decoration:none;">
         Reset Password
      </a>
      <p style="margin-top:20px; font-size:13px; color:#ccc;">
        This link will expire in <b>${expireMinutes} minutes</b>.
        <br>If you didn’t request this, you can safely ignore it.
      </p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject: "Reset Your Password",
      html,
    })
    console.log("📨 Reset email sent to", to)
  } catch (err) {
    console.error("❌ Failed to send reset email:", err)
  }
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; background:#111; color:#eee; padding:20px; border-radius:10px;">
      <h2 style="color:#facc15;">Verify Your Account</h2>
      <p>Welcome! Please click the button below to verify your email address:</p>
      <a href="${verifyUrl}" 
         style="display:inline-block; margin-top:10px; background:linear-gradient(90deg,#facc15,#f87171);
         color:#000; padding:12px 20px; border-radius:8px; font-weight:bold; text-decoration:none;">
         Verify My Account
      </a>
      <p style="margin-top:20px; font-size:13px; color:#ccc;">
        If you didn’t create an account, just ignore this email.
      </p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject: "Verify Your Account",
      html,
    })
    console.log("📨 Verification email sent to", to)
  } catch (err) {
    console.error("❌ Failed to send verification email:", err)
  }
}

export async function sendGenericMail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    })
    console.log(`📨 Email sent to ${to}: ${subject}`)
  } catch (err) {
    console.error("❌ Generic mail error:", err)
  }
}
