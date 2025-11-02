'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function VerifyPage() {
  const params = useSearchParams()
  const router = useRouter()

  const [phase, setPhase] = useState('loading')
  const [message, setMessage] = useState('Verifying your account...')
  const [detail, setDetail] = useState('Please wait while we confirm your email.')
  const redirectTimerRef = useRef(null)

  useEffect(() => {
    const token = params.get('token')
    const email = params.get('email')

    if (!token || !email) {
      setPhase('error')
      setMessage('Invalid verification link')
      setDetail('The link is missing required parameters or is malformed.')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, token }),
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Verification failed.')
        }

        setPhase('success')
        setMessage('Email verified')
        setDetail('Your account is now active. Redirecting you to login...')

        redirectTimerRef.current = setTimeout(() => {
          router.push('/login')
        }, 2000)

      } catch (err) {
        setPhase('error')
        setMessage('Verification failed')
        setDetail(err.message || 'The link is invalid or expired.')
      }
    }

    verify()

    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    }
  }, [params, router])

  const StatusIcon = () => {
    if (phase === 'loading') {
      return (
        <div className="relative flex items-center justify-center h-12 w-12 rounded-full bg-yellow-500/20 border border-yellow-400/40">
          <div className="h-3 w-3 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
          <div className="absolute h-full w-full rounded-full border border-yellow-500/20 animate-ping" />
        </div>
      )
    }

    if (phase === 'success') {
      return (
        <div className="relative flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-400/40">
          <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          <div className="absolute h-full w-full rounded-full border border-emerald-500/20 animate-ping" />
        </div>
      )
    }

    return (
        <div className="relative flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 border border-red-400/40">
          <div className="h-3 w-3 rounded-full bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          <div className="absolute h-full w-full rounded-full border border-red-500/20 animate-ping" />
        </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 text-white font-mono p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="
          relative w-full max-w-[380px] sm:max-w-[420px]
          rounded-3xl border-[1.5px] border-yellow-600/40
          bg-linear-to-br from-red-950/70 via-black/80 to-black/95
          shadow-[0_0_30px_rgba(255,215,0,0.25)]
          backdrop-blur-lg
          px-6 py-8 flex flex-col items-center text-center
        "
      >
        <div className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5px w-[40%] bg-linear-to-r from-yellow-400 via-red-500 to-transparent blur-[2px]" />

        <StatusIcon />

        <div className="mt-4 text-2xl font-extrabold tracking-wide drop-shadow-[0_0_10px_#ffc000aa] text-yellow-300 uppercase">
          {message}
        </div>

        <div className="mt-3 text-[12px] leading-relaxed text-yellow-100/80 max-w-[90%]">
          {detail}
        </div>

        {phase === 'success' && (
          <div className="mt-4 text-[10px] text-emerald-400/80 italic">
            You’ll be redirected to login automatically.
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col gap-3 w-full mt-8">
            <button
              onClick={() => router.push('/register')}
              className="
                w-full rounded-xl border border-yellow-600/40
                bg-neutral-900/80 text-yellow-300 text-sm font-bold py-2
                hover:bg-yellow-600/20 hover:shadow-[0_0_15px_rgba(255,215,0,0.4)]
                transition
              "
            >
              Back to Register
            </button>

            <button
              onClick={() => router.push('/login')}
              className="
                w-full rounded-xl border border-red-500/40
                bg-red-900/30 text-red-300 text-sm font-bold py-2
                hover:bg-red-600/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]
                transition
              "
            >
              Go to Login
            </button>
          </div>
        )}

        {phase === 'loading' && (
          <div className="mt-8 text-[10px] text-yellow-500/60 tracking-wide uppercase animate-pulse">
            contacting server...
          </div>
        )}

        {phase === 'success' && (
          <div className="
            mt-8 w-full rounded-xl border border-emerald-400/40
            bg-emerald-900/20 text-emerald-300 text-[12px] font-bold py-2
            shadow-[0_0_20px_rgba(16,185,129,0.4)]
            animate-pulse
          ">
            Verified ✓
          </div>
        )}
      </motion.div>
    </div>
  )
}
