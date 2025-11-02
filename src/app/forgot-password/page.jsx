'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MdEmail } from 'react-icons/md'
import { RiLockPasswordFill } from 'react-icons/ri'
import { Overlay } from '@/app/components/ui/overlay-skeleton'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // token & email kalau user datang dari link email
  const urlToken = searchParams.get('token') || ''
  const urlEmail = searchParams.get('email') || ''

  // state
  const [step, setStep] = useState(urlToken ? 2 : 1)

  const [email, setEmail] = useState(urlEmail || '')
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')

  const [status, setStatus] = useState({
    sending: false,
    sent: false,
    error: '',
    resetting: false,
    resetError: '',
  })

  const emailLocked = Boolean(urlToken) // kalau datang dari link, email gak boleh diganti

  // kirim request reset link
  const sendResetLink = async () => {
    if (!email.trim()) {
      setStatus(s => ({ ...s, error: 'Email is required' }))
      return
    }

    try {
      setStatus({
        sending: true,
        sent: false,
        error: '',
        resetting: false,
        resetError: '',
      })

      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      // kita selalu balikin 200 di backend even kalau email gak ada
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to send reset link')
      }

      setStatus({
        sending: false,
        sent: true,
        error: '',
        resetting: false,
        resetError: '',
      })
    } catch (err) {
      setStatus({
        sending: false,
        sent: false,
        error: err.message || 'Something went wrong',
        resetting: false,
        resetError: '',
      })
    }
  }

  // submit password baru
  const submitNewPassword = async () => {
    if (!pwd || !pwd2) {
      setStatus(s => ({ ...s, resetError: 'Password required' }))
      return
    }
    if (pwd !== pwd2) {
      setStatus(s => ({ ...s, resetError: 'Passwords do not match' }))
      return
    }
    if (!urlToken || !email) {
      setStatus(s => ({ ...s, resetError: 'Invalid or expired link' }))
      return
    }

    try {
      setStatus(s => ({
        ...s,
        resetting: true,
        resetError: '',
      }))

      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token: urlToken,
          password: pwd,
          password_confirmation: pwd2,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Reset failed')
      }

      // sukses -> redirect login
      router.push('/login')
    } catch (err) {
      setStatus(s => ({
        ...s,
        resetting: false,
        resetError: err.message || 'Reset failed',
      }))
    }
  }

  return (
    <Overlay
      items={
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center w-[90%] sm:w-[55%] md:w-[45%] xl:w-[35%] py-8 rounded-3xl bg-linear-to-br from-red-950/70 via-black/80 to-black/95 border-[1.5px] border-yellow-600/40 shadow-[0_0_30px_rgba(255,215,0,0.2)] backdrop-blur-lg text-white"
        >
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-2xl md:text-4xl font-extrabold text-yellow-400 tracking-wider drop-shadow-[0_0_10px_#ffc000aa]">
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <div className="h-0.5 w-28 mt-2 bg-linear-to-r from-yellow-500 to-red-600 rounded-full" />
          </div>

          {step === 1 && (
            <div className="flex flex-col w-[85%] gap-6">

              <div className="flex items-center gap-3 bg-neutral-900/80 border border-yellow-700/40 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-yellow-500 transition">
                <span className="text-yellow-400 text-lg"><MdEmail /></span>
                <input
                  type="email"
                  placeholder="Email / Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status.sending}
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 disabled:text-gray-500"
                />
              </div>

              {status.error && (
                <p className="text-sm text-red-400">{status.error}</p>
              )}
              {status.sent && (
                <p className="text-sm text-green-400">
                  Check your inbox. We sent you a reset link.
                </p>
              )}

              <div className="flex justify-between items-center text-sm md:text-base text-gray-400">
                <Link href="/login" className="hover:text-yellow-400 transition">
                  Back to Login
                </Link>
                <Link href="/register" className="text-yellow-400 hover:text-yellow-500 transition">
                  Register
                </Link>
              </div>

              <motion.button
                whileHover={{
                  scale: status.sending ? 1 : 1.05,
                  boxShadow: status.sending ? 'none' : '0 0 20px rgba(255,215,0,0.5)',
                }}
                whileTap={{ scale: status.sending ? 1 : 0.97 }}
                disabled={status.sending}
                onClick={sendResetLink}
                className={`relative overflow-hidden mt-2 px-12 py-3 text-xl font-bold tracking-wide rounded-2xl bg-linear-to-r from-yellow-600 via-orange-500 to-red-600 border border-yellow-700/60 text-black shadow-[0_0_20px_rgba(255,200,0,0.3)] hover:brightness-110 active:opacity-80 transition
                ${status.sending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="relative z-10">
                  {status.sending ? 'Sending...' : 'Send Reset Link'}
                </span>
                {!status.sending && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-linear-to-r from-transparent via-yellow-400/20 to-transparent"
                  />
                )}
              </motion.button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col w-[85%] gap-6">

              <div className="flex flex-col text-sm text-gray-300 gap-1">
                <span>Resetting password for</span>
                <span className="text-yellow-400 break-all">{email}</span>

                {!urlToken && (
                  <span className="text-red-400">
                    Invalid or missing reset token. Request a new link.
                  </span>
                )}

                {status.resetError && (
                  <span className="text-red-400">{status.resetError}</span>
                )}
              </div>

              <div className="flex items-center gap-3 bg-neutral-900/80 border border-yellow-700/40 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-yellow-500 transition">
                <span className="text-yellow-400 text-lg"><RiLockPasswordFill /></span>
                <input
                  type="password"
                  placeholder="New password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                />
              </div>

              <div className="flex items-center gap-3 bg-neutral-900/80 border border-yellow-700/40 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-yellow-500 transition">
                <span className="text-yellow-400 text-lg"><RiLockPasswordFill /></span>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                />
              </div>

              <div className="flex justify-between items-center text-sm md:text-base text-gray-400">
                {!emailLocked && (
                  <button
                    onClick={() => {
                      setStep(1)
                      setStatus(s => ({
                        ...s,
                        sent: false,
                        error: '',
                        resetError: '',
                      }))
                    }}
                    className="hover:text-yellow-400 transition"
                  >
                    Change email
                  </button>
                )}

                <button
                  onClick={() => {
                    setStep(1)
                    setStatus(s => ({
                      ...s,
                      sent: false,
                      error: '',
                      resetError: '',
                    }))
                  }}
                  className="text-yellow-400 hover:text-yellow-500 transition"
                >
                  Resend link
                </button>
              </div>

              <motion.button
                whileHover={{
                  scale: status.resetting ? 1 : 1.05,
                  boxShadow: status.resetting ? 'none' : '0 0 20px rgba(255,215,0,0.5)',
                }}
                whileTap={{ scale: status.resetting ? 1 : 0.97 }}
                disabled={status.resetting}
                onClick={submitNewPassword}
                className={`relative overflow-hidden mt-2 px-12 py-3 text-xl font-bold tracking-wide rounded-2xl bg-linear-to-r from-yellow-600 via-orange-500 to-red-600 border border-yellow-700/60 text-black shadow-[0_0_20px_rgba(255,200,0,0.3)] hover:brightness-110 active:opacity-80 transition
                ${status.resetting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="relative z-10">
                  {status.resetting ? 'Updating...' : 'Set New Password'}
                </span>
                {!status.resetting && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-linear-to-r from-transparent via-yellow-400/20 to-transparent"
                  />
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      }
    />
  )
}
