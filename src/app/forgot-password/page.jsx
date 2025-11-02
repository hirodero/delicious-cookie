import { Suspense } from 'react'
import ForgotPasswordClient from './ForgotPasswordClient'

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordFallback />}>
      <ForgotPasswordClient />
    </Suspense>
  )
}

function ForgotPasswordFallback() {
  // simple loading shell so Suspense is happy
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 text-white font-mono p-4">
      <div
        className="
          flex flex-col items-center justify-center
          w-[90%] sm:w-[55%] md:w-[45%] xl:w-[35%]
          py-8 rounded-3xl
          bg-linear-to-br from-red-950/70 via-black/80 to-black/95
          border-[1.5px] border-yellow-600/40
          shadow-[0_0_30px_rgba(255,215,0,0.2)]
          backdrop-blur-lg text-white
        "
      >
        <div className="text-2xl md:text-4xl font-extrabold text-yellow-400 tracking-wider drop-shadow-[0_0_10px_#ffc000aa]">
          Please wait...
        </div>
        <div className="h-0.5 w-28 mt-2 bg-linear-to-r from-yellow-500 to-red-600 rounded-full" />

        <div className="mt-6 text-yellow-400 text-xs uppercase tracking-wide animate-pulse">
          loading
        </div>
      </div>
    </div>
  )
}
