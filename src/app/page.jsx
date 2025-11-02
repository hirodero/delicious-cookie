'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { sail } from '@/app/font'

export default function Home() {
  const router = useRouter()
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="
        relative min-h-svh w-full overflow-hidden text-white
      "
    >
      <div className="pointer-events-none animate-pulse absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.09)_22%,rgba(255,100,0,0.12)_40%,rgba(0,0,0,0.92)_100%)]" />

      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center ">
        <Image
          src="/assets/logo_cuanverse_optimized.png"
          alt="CuanVerse"
          width={300}
          height={300}
          priority
          className="opacity-80 brightness-125 contrast-150 animate-pulse w-[90px] sm:w-[180px] md:w-[220px] lg:w-[300px] h-auto"
        />
      </div>

      <div
        className="
          absolute bottom-0 left-[-10%] w-[86%] h-[53svh] z-0
          sm:left-[-8%] sm:w-[82%] sm:h-[74svh]
          md:left-[-6%] md:w-[76%] md:h-[76svh]
          lg:left-auto lg:right-0 lg:w-[46%] lg:h-[78svh]
          xl:h-[80svh] 2xl:h-[82svh]
        "
        aria-hidden
      >
        <Image
          src="/assets/bro.png"
          alt=""
          fill
          priority
          className="
            object-contain object-bottom pointer-events-none
            opacity-85
            [mask-image:linear-gradient(
              to_top,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,0.85) 30%,
              rgba(0,0,0,0.55) 52%,
              rgba(0,0,0,0.25) 68%,
              rgba(0,0,0,0.08) 80%,
              rgba(0,0,0,0) 92%
            )]
            lg:mask-none
          "
        />
        <div className="absolute -bottom-4 -left-6 h-[55%] w-[75%] rounded-[999px] bg-[radial-gradient(120%_120%_at_0%_100%,rgba(0,0,0,0.6),rgba(0,0,0,0))] lg:hidden" />
      </div>

      <section className="relative z-10 w-[92%] max-w-[1200px] pt-16 pb-10 md:pt-20 lg:pt-24">
        <div className=" rounded-xl px-6 sm:px-8 md:px-12 lg:px-16 py-8 md:py-10 max-w-[800px]">
          <h1 className="font-extrabold leading-tight tracking-tight">
            <span className="block text-[clamp(26px,5vw,64px)]">Welcome to</span>
            <span className={`${sail.className} block text-amber-400 text-[clamp(34px,6.5vw,68px)] leading-tight`}>
              CuanVerse
            </span>
          </h1>

          <p className="mt-4 max-w-[72ch] text-blue-300/95 text-[clamp(14px,2.3vw,20px)] leading-relaxed">
            CuanVerse adalah sebuah platform yang menyediakan fasilitas{' '}
            <span className="text-yellow-400 font-semibold">video based learning</span>{' '}
            untuk mendukung pemahaman kamu terhadap e-book yang sudah kamu beli.
          </p>

          <div className="mt-8">
            <button
              onClick={() => router.push('/courses')}
              className="
                relative inline-flex items-center justify-center
                rounded-xl px-10 py-4 font-bold
                text-[clamp(12px,1.8vw,18px)]
                border border-yellow-500/70 bg-black/85
                transition-all
                shadow-[0_0_18px_rgba(255,200,0,0.18)]
                hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(255,200,0,0.28)]
                hover:bg-linear-to-tr hover:from-red-600 hover:to-yellow-400 hover:text-black
              "
            >
              Explore Course
            </button>
          </div>
        </div>
      </section>

      <aside
        className="
          hidden lg:block z-10
          absolute right-6 xl:right-10
          bottom-8 xl:bottom-10
          text-right
        "
      >
        <h2 className={`${sail.className} text-amber-400 text-[clamp(22px,2.6vw,40px)]`}>Valen Rewah</h2>
        <p className="text-blue-300 text-[clamp(12px,1.4vw,16px)]">Influencer, and Entrepreneur</p>
        <ul className="mt-2 space-y-1 text-blue-200 text-[clamp(11px,1.2vw,14px)] leading-5">
          <li>- 13.5M+ Followers on TikTok</li>
          <li>- 5.5M+ Followers on YouTube</li>
          <li>- 2.1M+ Followers on Instagram</li>
        </ul>
        <div className="mt-3 text-yellow-400 font-semibold text-[clamp(11px,1.2vw,14px)]">
          <p>Founder & CMO of The LGND</p>
          <p>Founder & CMO of Inside Glow</p>
        </div>
      </aside>

      <aside
        className="
          lg:hidden
          absolute bottom-[calc(env(safe-area-inset-bottom,0px)+18px)] right-4
          z-10 w-[64%] max-w-[310px] text-right
          rounded-xl bg-black/38 backdrop-blur-[2px] px-3.5 py-3
        "
      >
        <h2 className={`${sail.className} text-amber-400 text-[20px] leading-tight`}>Valen Rewah</h2>
        <p className="text-blue-300 text-[12.5px]">Influencer, and Entrepreneur</p>
        <ul className="mt-1.5 space-y-1 text-blue-200 text-[11.5px] leading-5">
          <li>- 13.5M+ Followers on TikTok</li>
          <li>- 5.5M+ Followers on YouTube</li>
          <li>- 2.1M+ Followers on Instagram</li>
        </ul>
        <div className="mt-2.5 text-yellow-400 font-semibold text-[11.5px]">
          <p>Founder & CMO of The LGND</p>
          <p>Founder & CMO of Inside Glow</p>
        </div>
      </aside>
    </motion.main>
  )
}
