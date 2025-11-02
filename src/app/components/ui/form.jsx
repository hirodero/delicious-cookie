'use client'

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { FaUser } from "react-icons/fa"
import { MdEmail } from "react-icons/md"
import { RiLockPasswordFill } from "react-icons/ri"
import Link from "next/link"
import { motion } from "framer-motion"
import { Overlay } from "./overlay-skeleton"
import { useAuth } from "@/app/context/auth"

function FloatingNotice({ type, message, sub }) {
  if (!message) return null

  const color = type === 'success'
    ? {
        border: "border-yellow-400/40",
        bg: "bg-black/70",
        textMain: "text-yellow-200",
        textHead: "text-yellow-300",
        pulseDot: "bg-yellow-400",
        shadow: "shadow-[0_0_25px_rgba(255,215,0,0.4)]"
      }
    : {
        border: "border-red-500/40",
        bg: "bg-black/70",
        textMain: "text-red-200",
        textHead: "text-red-300",
        pulseDot: "bg-red-400",
        shadow: "shadow-[0_0_25px_rgba(239,68,68,0.4)]"
      }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`
        absolute self-center top-0 z-20 max-w-[85%] sm:max-w-[70%]
        rounded-xl px-4 py-3 text-[12px] md:text-[13px] leading-relaxed
        border ${color.border} ${color.bg} ${color.shadow} backdrop-blur-[2px]
      `}
    >
      <div className={`font-bold mb-1 flex items-center gap-2 ${color.textHead}`}>
        <span className={`inline-block h-2 w-2 rounded-full ${color.pulseDot} animate-pulse`} />
        {type === 'success' ? 'Verification link sent' : 'Error'}
      </div>
      <div className={`${color.textMain}`}>
        {message}
      </div>
      {sub && (
        <div className="text-[11px] md:text-[12px] opacity-70 mt-2 italic">
          {sub}
        </div>
      )}
    </motion.div>
  )
}

export default function Form() {
  const path = usePathname()
  const router = useRouter()
  const { login } = useAuth()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    repassword: ''
  })

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  const isRegister = path === '/register'

  const list = {
    '/register': {
      cols: [
        { label: 'Username', icon: <FaUser />, key: 'username' },
        { label: 'Gmail', icon: <MdEmail />, key: 'email' },
        { label: 'Password', icon: <RiLockPasswordFill />, key: 'password' },
        { label: 'Re-enter password', icon: <RiLockPasswordFill />, key: 'repassword' },
      ],
      submitText: 'Create Account',
      link: <Link href="/login" className="text-yellow-400 hover:text-yellow-500 transition">Login</Link>,
      footerNote: "By creating an account, you’ll get access after verifying your email.",
    },
    '/login': {
      cols: [
        { label: 'Username', icon: <FaUser />, key: 'username' },
        { label: 'Password', icon: <RiLockPasswordFill />, key: 'password' },
      ],
      submitText: 'Login Now',
      link: <Link href="/register" className="text-yellow-400 hover:text-yellow-500 transition">Register</Link>,
      footerNote: "You must verify your email before login.",
    },
  }

  const setter = list[path] ?? {}

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (isRegister) {
        if (!form.username.trim() || !form.email.trim() || !form.password) {
          setError('Lengkapi semua field.')
          return
        }
        if (form.password !== form.repassword) {
          setError('Password tidak cocok.')
          return
        }

        const r = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password
          })
        })

        const data = await r.json()

        if (!r.ok) {
          setError(data?.error || 'Gagal registrasi')
          return
        }

        setSuccessMsg(
          `We sent a verification link to ${form.email.trim()}. Please check your inbox.`
        )

        setForm({
          username: '',
          email: '',
          password: '',
          repassword: ''
        })

        return
      }

      if (!form.username.trim() || !form.password) {
        setError('Isi username/email dan password.')
        return
      }

      await login({
        username: form.username.trim(),
        password: form.password
      })

      router.push('/courses')
    } catch (e) {
      setError(e?.message || 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Overlay
      items={
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="
            relative
            flex flex-col items-center justify-center
            w-[90%] sm:w-[55%] md:w-[45%] xl:w-[35%]
            py-8 rounded-3xl
            bg-linear-to-br from-red-950/70 via-black/80 to-black/95
            border-[1.5px] border-yellow-600/40
            shadow-[0_0_30px_rgba(255,215,0,0.2)]
            backdrop-blur-lg
            text-white font-mono
          "
        >
          <FloatingNotice
            type="success"
            message={successMsg}
            sub={
              successMsg
                ? "You can close this tab after verifying. Then log in."
                : null
            }
          />

          {!successMsg && (
            <FloatingNotice
              type="error"
              message={error}
              sub={error ? "Please try again." : null}
            />
          )}

          <div className="flex flex-col items-center justify-center mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-400 tracking-wider drop-shadow-[0_0_10px_#ffc000aa] uppercase">
              {path.slice(1)}
            </h1>
            <div className="h-0.5 w-24 mt-2 bg-linear-to-r from-yellow-500 to-red-600 rounded-full"></div>
          </div>

          <div className="flex flex-col w-[85%] gap-6 mb-8">
            {setter.cols?.map((item, index) => (
              <motion.div
                key={index}
                whileHover={successMsg && isRegister ? {} : { scale: 1.03 }}
                transition={{ duration: 0.15 }}
                className={`
                  flex items-center gap-3 rounded-2xl px-4 py-3 border
                  ${
                    successMsg && isRegister
                      ? 'bg-neutral-800/40 border-neutral-700/40 opacity-40 pointer-events-none select-none'
                      : 'bg-neutral-900/80 border-yellow-700/40 focus-within:ring-2 focus-within:ring-yellow-500 transition'
                  }
                `}
              >
                <span className="text-yellow-400 text-lg">{item.icon}</span>
                <input
                  type={item.label.toLowerCase().includes("password") ? "password" : "text"}
                  placeholder={item.label}
                  disabled={!!(successMsg && isRegister)}
                  value={form[item.key]}
                  onChange={(e) => handleChange(item.key, e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 disabled:text-gray-500 disabled:placeholder-gray-600"
                />
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col gap-2 items-center w-[80%] text-sm md:text-base text-gray-400 mb-6">
            <div className="flex w-full justify-between">
              <Link
                href="/forgot-password"
                className={`hover:text-yellow-400 transition ${
                  isRegister ? 'invisible pointer-events-none' : ''
                }`}
              >
                Forgot Password?
              </Link>

              {setter.link}
            </div>

            {setter.footerNote && (
              <div className="w-full text-[10px] text-gray-500 text-center leading-relaxed">
                {setter.footerNote}
              </div>
            )}
          </div>

          <motion.button
            whileHover={
              loading || (successMsg && isRegister)
                ? {}
                : { scale: 1.05, boxShadow: "0 0 20px rgba(255,215,0,0.5)" }
            }
            whileTap={
              loading || (successMsg && isRegister)
                ? {}
                : { scale: 0.97 }
            }
            disabled={loading || (successMsg && isRegister)}
            onClick={handleSubmit}
            className={`
              relative overflow-hidden px-12 py-3 text-xl font-bold tracking-wide rounded-2xl border text-black
              shadow-[0_0_20px_rgba(255,200,0,0.3)]
              ${
                successMsg && isRegister
                  ? "bg-linear-to-r from-yellow-400 via-amber-300 to-yellow-500 border-yellow-300 text-black animate-pulse"
                  : "bg-linear-to-r from-yellow-600 via-orange-500 to-red-600 border-yellow-700/60 hover:brightness-110 active:opacity-80"
              }
              ${loading ? "opacity-70 cursor-wait" : ""}
            `}
          >
            <span className="relative z-10 whitespace-nowrap">
              {successMsg && isRegister
                ? "Check Your Email"
                : loading
                  ? "Processing..."
                  : setter.submitText ?? "Submit"}
            </span>

            {!loading && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-linear-to-r from-transparent via-yellow-400/20 to-transparent"
              />
            )}
          </motion.button>
        </motion.div>
      }
    />
  )
}
