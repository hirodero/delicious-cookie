'use client'

import { usePathname, useRouter } from 'next/navigation'
import { IoChevronBackCircleSharp } from 'react-icons/io5'
import { FaCircleUser, FaBookOpen } from 'react-icons/fa6'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { useAuth } from '@/app/context/auth'

export default function Header({ sidebar }) {
  const router = useRouter()
  const path = usePathname()
  const { user, loading, logout } = useAuth()

  const isLessonsPage = path.startsWith('/courses/lessons')
  const effectiveSidebar = isLessonsPage ? sidebar : true

  const [firstCourseId, setFirstCourseId] = useState(null)

  useEffect(() => {
    async function fetchFirstCourse() {
      try {
        const res = await fetch('/api/courses', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.courses) && data.courses.length > 0) {
          setFirstCourseId(data.courses[0].id)
        } else {
          setFirstCourseId(null)
        }
      } catch (err) {
        console.error('[HEADER] failed to fetch first course', err)
        setFirstCourseId(null)
      }
    }
    fetchFirstCourse()
  }, [])

  const handleBack = () => {
    if (path === '/courses') router.push('/')
    else router.back()
  }

  const elements = [
    {
      key: 'courses',
      icon: <FaBookOpen className="text-lg md:text-2xl" />,
      label: 'Courses',
      isActive: path === '/courses',
      link: '/courses',
    },
    {
      key: 'learning',
      icon: <IoChevronBackCircleSharp className="text-lg md:text-2xl" />,
      label: 'Lessons',
      isActive: isLessonsPage,
      link: '/courses/lessons/placeholder',
    },
  ]

  const handleNavClick = (item) => {
    if (item.key === 'learning') {
      if (!firstCourseId) {
        router.push('/courses')
        return
      }
      router.push(`/courses/lessons/${firstCourseId}`)
      return
    }

    router.push(item.link)
  }

  const [openProfile, setOpenProfile] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    setOpenProfile(false)
    router.push('/login')
  }

  return (
    <motion.header
      initial={{ width: '100%', opacity: 0 }}
      animate={{
        width: effectiveSidebar ? '100%' : '75%',
        opacity: 1,
      }}
      transition={
        effectiveSidebar
          ? { duration: 0.4, ease: 'easeInOut' }
          : { duration: 0.45, ease: 'easeOut' }
      }
      className={clsx(
        'fixed right-0 z-40 flex flex-col text-white',
        'border-b border-red-200/70 outline-3 outline-yellow-800/80',
        'bg-neutral-950/70 backdrop-blur-xs',
        'h-auto md:h-16 xl:h-[10%] w-full'
      )}
    >
      <div
        className={clsx(
          'flex w-full items-center px-3 py-2 md:px-4 md:py-2',
          'justify-between gap-3 md:gap-4'
        )}
      >
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button
            onClick={handleBack}
            className={clsx(
              'flex items-center justify-center text-white hover:opacity-70 active:opacity-100',
              'rounded-full',
              'text-3xl md:text-3xl xl:text-4xl'
            )}
            aria-label="Back"
          >
            <IoChevronBackCircleSharp />
          </button>

          <div
            className={clsx(
              'flex items-center',
              'h-8 w-16',
              'md:h-10 md:w-24 xl:h-12 xl:w-28'
            )}
          >
            <img
              src="/assets/logo_cuanverse_optimized.png"
              alt="CuanVerse"
              className={clsx(
                'object-contain w-full h-full',
                'drop-shadow-[0_0_6px_rgba(255,215,0,0.35)]'
              )}
            />
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold px-4">
          {elements.map((it) => (
            <button
              key={it.key}
              onClick={() => handleNavClick(it)}
              className={clsx(
                'flex flex-col items-center justify-center transition-all',
                'hover:text-yellow-400 hover:scale-105',
                it.isActive ? 'text-yellow-500' : 'text-white'
              )}
            >
              {it.icon}
              <span className="leading-none mt-0.5">{it.label}</span>
            </button>
          ))}
        </nav>

        <div className="relative shrink-0" ref={profileRef}>
          <button
            onClick={() => setOpenProfile((s) => !s)}
            className={clsx(
              'flex items-center gap-2 cursor-pointer',
              'hover:opacity-90 active:opacity-100'
            )}
            aria-label="Profile menu"
          >
            <div className="hidden md:flex flex-col text-right leading-tight max-w-[120px]">
              <span className="text-[11px] font-semibold text-white/90 truncate">
                {loading ? '...' : user?.username ?? 'Guest'}
              </span>
              <span className="text-[10px] text-yellow-400/90 font-medium truncate">
                {user?.role ?? 'visitor'}
              </span>
            </div>

            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user?.username ?? 'User'}
                className={clsx(
                  'rounded-full ring-2 ring-yellow-600/60 object-cover',
                  'h-8 w-8 md:h-9 md:w-9'
                )}
              />
            ) : (
              <FaCircleUser
                className={clsx(
                  'text-white transition-colors',
                  'hover:text-yellow-400',
                  'text-3xl md:text-4xl'
                )}
              />
            )}
          </button>

          <AnimatePresence>
            {openProfile && (
              <motion.div
                key="profile-dd"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className={clsx(
                  'absolute right-0 mt-3 w-56 md:w-60 rounded-xl shadow-xl z-50 overflow-hidden',
                  'bg-neutral-900/95 backdrop-blur-xl border border-yellow-600/40'
                )}
              >
                <div className="px-4 py-3 border-b border-yellow-700/40 text-sm">
                  <p className="text-yellow-400 font-semibold truncate">
                    {user?.username ?? 'Guest'}
                  </p>
                  <p className="text-white/70 text-[11px] truncate">
                    {user?.email ?? 'Not signed in'}
                  </p>
                  {user?.role && (
                    <span
                      className={clsx(
                        'mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full',
                        'border border-yellow-600/60 text-yellow-300/90'
                      )}
                    >
                      {user.role}
                    </span>
                  )}
                </div>

                <div className="flex flex-col text-sm">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className={clsx(
                        'text-left px-4 py-2 text-red-300',
                        'hover:bg-red-600/20 hover:text-red-200 transition-colors'
                      )}
                    >
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setOpenProfile(false)
                        router.push('/login')
                      }}
                      className={clsx(
                        'text-left px-4 py-2 text-yellow-300',
                        'hover:bg-yellow-600/20 hover:text-yellow-200 transition-colors'
                      )}
                    >
                      Sign in
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex md:hidden w-full px-3 pb-2 -mt-1">
        <nav className="flex flex-row flex-1 justify-evenly text-[10px] font-semibold">
          {elements.map((it) => (
            <button
              key={it.key}
              onClick={() => handleNavClick(it)}
              className={clsx(
                'flex flex-col items-center justify-center flex-1 py-1 rounded-lg',
                'active:scale-[0.98] transition-all',
                it.isActive
                  ? 'text-yellow-400 bg-yellow-500/10 ring-1 ring-yellow-600/40'
                  : 'text-white/80 bg-white/5 ring-1 ring-white/10'
              )}
            >
              {it.icon}
              <span className="mt-0.5 leading-none">{it.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </motion.header>
  )
}
