'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { sail } from '@/app/font'
import { useState, useEffect, useMemo } from 'react'

export default function Home() {
  const router = useRouter()
  const cookies=['cookie1.png','cookie2.png','cookie3.png']
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    cookies.forEach((src) => {
      const img = new window.Image()
      img.src = `/assets/${src}`
    })
  }, [])
    useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % cookies.length)
    }, 2000)
    return () => clearInterval(id)
  }, [])

  const variants = useMemo(
    () => ({
      enter: { opacity: 0, translateX: 200, translateY: 200, rotate:-30, scale:0.8 },
      center: { opacity: 1 ,translateX: 0, translateY: 0, rotate:0, scale:1 },
      exit: { opacity: 0, translateX: 200 , translateY: 200, rotate:30, scale:0.8 },
    }),
    []
  )
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="
        relative h-full w-full overflow-hidden text-white
      "
    >
      <div className="pointer-events-none animate-pulse absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.20)_22%,rgba(255,100,0,0.12)_40%,rgba(255,128,0,0.52)_100%)]" />

      <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center ">
        <Image
          src="/assets/cookie1.png"
          alt="cookie"
          width={300}
          height={300}
          priority
          className="opacity-90 brightness-125 contrast-150 animate-pulse w-[90px] sm:w-[180px] md:w-[220px] lg:w-[300px] h-auto"
        />
      </div>
      <AnimatePresence mode='sync'>
        <motion.div
        key={cookies[idx]}
        variants={variants}
        initial={'enter'}
        animate={'center'}
        exit={'exit'}
        transition={{ duration: 2,opacity:{duration:0.5}, translateX:{duration:0.4}, translateY:{duration:0.4}, type:'spring', ease:'easeInOut' }}
          className="
            absolute bottom-0 right-[-10%] w-[86%] h-[44svh] z-0
            sm:left-[-8%] sm:w-[82%] sm:h-[74svh]
            md:left-[-6%] md:w-[76%] md:h-[76svh]
            lg:left-auto lg:right-0 lg:w-[46%] lg:h-[78svh]
            xl:h-[80svh] 2xl:h-[82svh]
          "
          aria-hidden
        >
          <Image
            src={`/assets/${cookies[idx]}`}
            alt=""
            fill
            priority
            className="
              object-contain object-bottom pointer-events-none
              brightness-110 contrast-115
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
        </motion.div>
      </AnimatePresence>

      <section className="relative z-10 w-[92%] max-w-[1200px] pt-16 pb-10 md:pt-20 lg:pt-24">
        <div className=" rounded-xl px-6 sm:px-8 md:px-12 lg:px-16 py-8 md:py-10 max-w-[700px]">
          <h1 className="font-extrabold leading-tight tracking-tight">
            <span className="block text-[clamp(6px,5vw,45px)]">Welcome to</span>
            <span className={`${sail.className} block text-amber-400 text-[clamp(49px,6.5vw,80px)] leading-tight`}>
              Cookie Pookie
            </span>
          </h1>

          <p className="mt-4 max-w-[72ch] text-white text-[clamp(14px,2.3vw,20px)] leading-relaxed">
            Try your luck to find a cookie of your preference!
            <br />
            <span className='text-amber-400'>
              If you are smart enough, then you might find a secret one! 
            </span>
          </p>

          <div className="flex lg:justify-start lg:items-start mt-8 h-full">
            <button
              onClick={() => router.push('/cookies')}
              className="
              hidden
                relative lg:inline-flex items-center justify-center
                rounded-xl px-30 py-10 font-bold my-2
                text-[clamp(12px,1.8vw,18px)]
                border border-yellow-500/70 bg-amber-950/85
                transition-all
                shadow-[0_0_18px_rgba(255,200,0,0.18)]
                hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(255,200,0,0.28)]
                hover:bg-amber-400 hover:text-white
              "
            >
              Explore 
            </button>
            <button
              onClick={() => router.push('/cookies')}
              className="
              lg:hidden
                relative inline-flex items-center justify-center
                rounded-xl px-10 py-4 font-bold
                text-[clamp(12px,1.8vw,18px)]
                border border-yellow-500/70 bg-amber-800/85
                transition-all
                shadow-[0_0_18px_rgba(255,200,0,0.18)]
                hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(255,200,0,0.28)]
                hover:bg-linear-to-tr hover:from-red-600 hover:to-yellow-400 hover:text-black
              "
            >
              Explore 
            </button>
          </div>
        </div>
      </section>

    </motion.main>
  )
}
