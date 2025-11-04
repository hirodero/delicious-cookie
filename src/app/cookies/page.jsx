'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

function getCookie(name) {
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return m ? decodeURIComponent(m[2]) : ''
}
function setCookie(name, value, maxAgeSec = 60 * 60 * 24) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSec}`
}

export default function PuzzlePage() {
  const cookies = [
    {
      src:'/assets/cookie1.png',
      desc:'a very basic cookie, nothing special about this, how unlucky...'
    }, {
      src:'/assets/cookie2.png',
      desc:'a cookie with a strawberry jam, tasty!'
    },{
      src:'/assets/cookie3.png',
      desc:'hmm, a very popular commercial cookie. i think its called orewo?'
    }
  ]
  const secret = {src: '/assets/secret_cookie.png',desc: 'you found the very special cookie! congratulations!'}
  const shuffle = ['/assets/cookie1.png', '/assets/cookie2.png', '/assets/cookie3.png','/assets/mysterious_cookie.png']
  
  const [currentImg, setCurrentImg] = useState(shuffle[3])
  const [flag, setFlag] = useState(null)
  const [isShuffling, setIsShuffling] = useState(false)
  const [desc, setDesc] = useState('')
  const shuffleIntervalRef = useRef(null)
  const shuffleTimeoutRef  = useRef(null)

  useEffect(() => {
    [...cookies, secret].forEach((items) => {
      const img = new window.Image()
      img.src = items.src
    })
    if (!getCookie('cookie')) setCookie('cookie', 'normal')

    return () => {
      if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current)
      if (shuffleTimeoutRef.current) clearTimeout(shuffleTimeoutRef.current)
    }
  }, [])

  function randPick(arr) {
    const idx = Math.floor(Math.random() * arr.length)
    return arr[idx]
  }

  async function onGenerate() {
    setFlag(null)
    setIsShuffling(true)

    let i = 0
    setCurrentImg(shuffle[i])
    shuffleIntervalRef.current = setInterval(() => {
      i = (i + 1) % shuffle.length
      setCurrentImg(shuffle[i])
    }, 90)

    await new Promise((r) => {
      shuffleTimeoutRef.current = setTimeout(r, 900)
    })

    clearInterval(shuffleIntervalRef.current)
    shuffleIntervalRef.current = null
    setIsShuffling(false)
    const cookieValue = getCookie('cookie')
    if (cookieValue === 'secret') {
      setDesc(secret.desc)
      setCurrentImg(secret.src)
      try {
        const res = await fetch('/api/flag')
        const j = await res.json()
        if (res.ok && j?.secret) setFlag(j.secret)
        else setFlag(j?.hint || j?.error || 'Flag tidak ditemukan.')
      } catch (e) {
        setFlag(String(e))
      }
    } else {
      const pick = randPick(cookies)
      setDesc(pick.desc)
      setCurrentImg(pick.src)
    }
  }

  return (
    <main className="relative h-full w-full text-white">
      <section className="relative z-10 mx-auto w-[92%] max-w-[1100px] pt-10 pb-16 md:pt-16 lg:pt-20">
        <div className="max-w-[760px]">
          <h1 className="font-extrabold leading-tight tracking-tight">
            <span className="block text-amber-300 text-[clamp(40px,6vw,84px)] leading-tight drop-shadow-[0_0_14px_rgba(255,180,0,0.25)]">
              Cookie Pool ! ! !
            </span>
          </h1>

          <p className="mt-3 max-w-[70ch] text-white/90 text-[clamp(14px,2.2vw,18px)] leading-relaxed">
            Click <b>GACHA</b> to get cookie!. 
          </p>
        </div>

        <div className="mt-8 grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl border border-amber-500/30 bg-amber-900/20 backdrop-blur-sm p-5 shadow-[0_0_24px_rgba(255,170,0,0.12)]">
              <div className="relative w-full h-[44svh] sm:h-[56svh] flex items-center justify-center overflow-hidden">
                <motion.img
                  key={`${currentImg}-${isShuffling ? 'S' : 'F'}`}
                  src={currentImg}
                  alt="cookie"
                  className={
                    'max-h-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)] ' +
                    (isShuffling ? 'blur-[1.5px] opacity-90' : '')
                  }
                  initial={{ opacity: 0, y: 24, rotate: -6, scale: 0.96 }}
                  animate={
                    isShuffling
                      ? { opacity: 1, y: 0, rotate: 0, scale: [1, 1.02, 0.98, 1] }
                      : { opacity: 1, y: 0, rotate: 0, scale: 1 }
                  }
                  transition={
                    isShuffling
                      ? { duration: 0.3, repeat: Infinity, ease: 'easeInOut', type: 'tween' }
                      : { duration: 0.45, ease: 'easeOut', type: 'spring' }
                  }
                />

                {!isShuffling && (
                  <motion.div
                    key={'glow-' + currentImg}
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="mx-auto h-24 w-24 rounded-full blur-3xl bg-amber-400/25" />
                  </motion.div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={onGenerate}
                  disabled={isShuffling}
                  className={
                    'relative inline-flex items-center justify-center rounded-xl px-6 py-3 font-bold ' +
                    'text-[clamp(12px,1.8vw,18px)] border border-yellow-500/70 ' +
                    (isShuffling
                      ? 'bg-amber-400/70 cursor-not-allowed'
                      : 'bg-amber-500 hover:shadow-[0_0_34px_rgba(255,200,0,0.34)]') +
                    ' text-black shadow-[0_0_20px_rgba(255,200,0,0.24)] transition-all'
                  }
                >
                  {isShuffling ? 'Shuffling…' : 'GACHA'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/12 bg-black/30 backdrop-blur-sm p-5 h-full">
              <div className="text-lg font-semibold">Cookie description!</div>
              <div className="mt-3 min-h-[120px] rounded-xl bg-neutral-900/50 border border-white/10 p-3">
                {!flag ? (
                  <div className="text-sm text-gray-400">
                    {desc}
                  </div>
                ) : (
                  <pre className="text-emerald-300 text-sm whitespace-pre-wrap">{flag}</pre>
                )}
              </div>
              <div className="mt-4 text-xs text-gray-400">
                Hint: The value is <span className='text-amber-400'>secret</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
