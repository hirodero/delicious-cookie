import { Suspense } from 'react'
import VerifyClient from './VerifyClient'

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyClient />
    </Suspense>
  )
}

function VerifyFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 text-white font-mono p-4">
      <div
        className="
          relative w-full max-w-[380px] sm:max-w-[420px]
          rounded-3xl border-[1.5px] border-yellow-600/40
          bg-linear-to-br from-red-950/70 via-black/80 to-black/95
          shadow-[0_0_30px_rgba(255,215,0,0.25)]
          backdrop-blur-lg
          px-6 py-8 flex flex-col items-center text-center
        "
      >
        <div className="relative flex items-center justify-center h-12 w-12 rounded-full bg-yellow-500/20 border border-yellow-400/40">
          <div className="h-3 w-3 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
          <div className="absolute h-full w-full rounded-full border border-yellow-500/20 animate-ping" />
        </div>

        <div className="mt-4 text-2xl font-extrabold tracking-wide drop-shadow-[0_0_10px_#ffc000aa] text-yellow-300 uppercase">
          Verifying your account...
        </div>

        <div className="mt-3 text-[12px] leading-relaxed text-yellow-100/80 max-w-[90%]">
          Please wait while we confirm your email.
        </div>

        <div className="mt-8 text-[10px] text-yellow-500/60 tracking-wide uppercase animate-pulse">
          contacting server...
        </div>
      </div>
    </div>
  )
}
