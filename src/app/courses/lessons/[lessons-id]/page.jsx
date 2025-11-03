'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { usePathname, useRouter, notFound } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { IoVideocamOutline } from 'react-icons/io5'
import { FaPencilAlt, FaTrashAlt, FaPlus } from 'react-icons/fa'
import { FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6'
import Header from '@/app/components/ui/header'

function Spinner({ className = '' }) {
  return (
    <div
      className={
        'h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white ' +
        className
      }
    />
  )
}

function BusyOverlay({ text = 'Processing…' }) {
  return (
    <div className="absolute inset-0 z-70 bg-black/40 backdrop-blur-[1px] flex items-center justify-center text-white text-sm font-semibold">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-neutral-900/90 px-6 py-4 ring-1 ring-white/20 shadow-xl">
        <Spinner className="h-6 w-6 border-2" />
        <div>{text}</div>
      </div>
    </div>
  )
}

function ConfirmDeleteModal({
  open,
  lessonTitle,
  loading,
  onCancel,
  onConfirm,
}) {
  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-90 bg-black/70 backdrop-blur-[2px]"
        onClick={() => {
          if (!loading) onCancel()
        }}
      />

      <div className="fixed inset-0 z-100 grid place-items-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-neutral-900 text-neutral-100 ring-1 ring-white/10 overflow-hidden shadow-xl shadow-black/60 border border-white/10">
          <div className="px-5 py-4 border-b border-white/10 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-red-400 ring-1 ring-red-500/40 text-lg font-bold">
              <FaTrashAlt />
            </div>
            <div className="flex flex-col">
              <div className="text-base font-semibold text-white">
                Delete lesson?
              </div>
              <div className="text-xs text-white/60 leading-relaxed">
                {`"${lessonTitle || 'Untitled'}" akan dihapus secara permanen.`}
                <br />
                Aksi ini tidak bisa di-undo.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4">
            <button
              disabled={loading}
              onClick={onCancel}
              className="rounded-md bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              onClick={onConfirm}
              className="inline-flex items-center gap-2 rounded-md bg-red-600/90 hover:bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Spinner />
                  <span>Deleting…</span>
                </>
              ) : (
                <>
                  <FaTrashAlt />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function VideoPlayer({ src, title, onEnd, loading }) {
  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-white/60 text-sm">
        Loading video…
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      {src ? (
        <video
          key={src}
          className="w-full h-full rounded-xl object-cover"
          autoPlay
          playsInline
          controls
          onEnded={onEnd}
        >
          <source src={src} />
          Browser kamu tidak mendukung <code>video</code>.
        </video>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white/80">
          {title || 'Video Placeholder'}
        </div>
      )}
    </div>
  )
}

function VideoModal({ open, initial, onClose, onSave, isDisabled }) {
  const fileRef = useRef(null)

  const [title, setTitle] = useState(initial?.title || '')
  const [desc, setDesc] = useState(initial?.description || '')

  const [videoKey, setVideoKey] = useState(initial?.videoKey || '')
  const [playUrl, setPlayUrl] = useState('')

  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0) 
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTitle(initial?.title || '')
    setDesc(initial?.description || '')
    setVideoKey(initial?.videoKey || '')
    setPlayUrl('')

    setUploading(false)
    setUploadPct(0)
    setSaving(false)
  }, [initial])

  useEffect(() => {
    async function loadSigned() {
      if (!videoKey) {
        setPlayUrl('')
        return
      }
      try {
        const r = await fetch(
          `/api/upload/video-url?key=${encodeURIComponent(videoKey)}`
        )
        const j = await r.json()
        if (r.ok && j.url) {
          setPlayUrl(j.url)
        } else {
          setPlayUrl('')
        }
      } catch (err) {
        console.error('signed url fail', err)
        setPlayUrl('')
      }
    }
    loadSigned()
  }, [videoKey])

  const pickFile = () => {
    if (!uploading && !saving && !isDisabled) fileRef.current?.click()
  }

  const onPick = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('video/')) {
      alert('Silakan pilih file video.')
      return
    }

    setUploading(true)
    setUploadPct(0)

    try {
      const form = new FormData()
      form.append('file', f)

      const xhr = new XMLHttpRequest()

      xhr.open('POST', '/api/upload/video', true)

      xhr.upload.onprogress = (ev) => {
        if (!ev.lengthComputable) return
        const pct = (ev.loaded / ev.total) * 100
        setUploadPct(pct)
      }

      xhr.onreadystatechange = async () => {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            let upData
            try {
              upData = JSON.parse(xhr.responseText)
            } catch {
              upData = null
            }

            if (!upData || !upData.storageKey) {
              alert('Upload gagal (no storageKey).')
              setUploading(false)
              return
            }

            const key = upData.storageKey
            setVideoKey(key)

            try {
              const urlRes = await fetch(
                `/api/upload/video-url?key=${encodeURIComponent(key)}`
              )
              const urlData = await urlRes.json()
              if (urlRes.ok && urlData.url) {
                setPlayUrl(urlData.url)
              } else {
                setPlayUrl('')
              }
            } catch (err2) {
              console.error('preview url fail', err2)
              setPlayUrl('')
            }

            if (!title) {
              setTitle(f.name.replace(/\.[^/.]+$/, ''))
            }

            setUploading(false)
            setUploadPct(100)
          } else {
            console.error('UPLOAD_FAIL', xhr.responseText)
            alert('Upload video gagal')
            setUploading(false)
            setUploadPct(0)
          }
        }
      }

      xhr.send(form)
    } catch (err) {
      console.error('UPLOAD_ERR', err)
      alert('Upload video gagal')
      setUploading(false)
      setUploadPct(0)
    }
  }

  const handleSave = async () => {
    if (!videoKey) {
      alert('Upload / pilih video dulu.')
      return
    }

    setSaving(true)
    await onSave({
      title: title || 'Untitled',
      description: desc || '',
      videoKey,
    })
    setSaving(false)
    onClose()
  }

  if (!open) return null

  const pctRounded = Math.floor(uploadPct)

  return (
    <>
      <div
        className="fixed inset-0 z-110 bg-black/70"
        onClick={() => {
          if (!uploading && !saving) onClose()
        }}
      />

      <div className="fixed inset-0 z-120 grid place-items-center p-4">
        <div className="relative w-full max-w-3xl rounded-2xl bg-neutral-900 text-neutral-100 ring-1 ring-white/10 overflow-hidden shadow-xl shadow-black/60 border border-white/10">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {initial ? 'Edit Lesson' : 'Tambah Lesson'}
              {(uploading || saving) && <Spinner />}
            </h3>

            <button
              disabled={uploading || saving}
              onClick={onClose}
              className="rounded-md bg-white/10 px-3 py-1.5 hover:bg-white/20 disabled:opacity-30"
            >
              ✕
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 p-5">
            <div>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
                {playUrl ? (
                  <video
                    className="w-full h-full object-cover"
                    controls
                    src={playUrl}
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-sm text-white/60">
                    {uploading ? 'Uploading…' : 'Belum ada video'}
                  </div>
                )}

                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-xs gap-2 px-4">
                    <Spinner className="h-6 w-6 border-2" />
                    <div className="text-white font-semibold text-sm">
                      Uploading video… {pctRounded}%
                    </div>

                    <div className="w-full max-w-[180px] bg-white/20 rounded-full h-2 overflow-hidden ring-1 ring-white/30">
                      <div
                        className="h-full bg-yellow-400 transition-all duration-100"
                        style={{ width: `${pctRounded}%` }}
                      />
                    </div>

                    <div className="text-[10px] text-white/50 uppercase tracking-wide">
                      please wait
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileRef}
                className="hidden"
                type="file"
                accept="video/*"
                onChange={onPick}
              />

              <button
                disabled={uploading || saving || isDisabled}
                onClick={pickFile}
                className="mt-3 w-full rounded-md bg-amber-500/20 px-4 py-2 hover:bg-amber-500/30 disabled:opacity-30 flex flex-col text-center"
              >
                {uploading ? (
                  <>
                    <div className="font-semibold text-white text-sm">
                      Uploading… {pctRounded}%
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mt-2 ring-1 ring-white/30">
                      <div
                        className="h-full bg-yellow-400 transition-all duration-100"
                        style={{ width: `${pctRounded}%` }}
                      />
                    </div>
                  </>
                ) : playUrl ? (
                  'Ganti Video'
                ) : (
                  'Pilih & Upload Video'
                )}
              </button>
            </div>

            <div>
              <label className="block text-sm opacity-80 mb-1">Judul</label>
              <input
                className="w-full rounded-md bg-white/5 px-3 py-2 ring-1 ring-white/10 focus:ring-2 focus:ring-amber-400 disabled:opacity-30"
                value={title}
                disabled={saving || uploading || isDisabled}
                onChange={(e) => setTitle(e.target.value)}
              />

              <label className="block text-sm opacity-80 mt-3 mb-1">
                Deskripsi
              </label>
              <textarea
                className="min-h-[120px] w-full rounded-md bg-white/5 px-3 py-2 ring-1 ring-white/10 focus:ring-2 focus:ring-amber-400 disabled:opacity-30"
                value={desc}
                disabled={saving || uploading || isDisabled}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 px-5 py-3 border-t border-white/10">
            <button
              disabled={uploading || saving}
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-30"
            >
              Batal
            </button>

            <button
              disabled={uploading || saving || isDisabled}
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-30 flex items-center gap-2"
            >
              {saving && <Spinner />}
              <span>Simpan</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    function sync() {
      setIsMobile(window.innerWidth < breakpoint)
    }
    sync()
    setHydrated(true)
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [breakpoint])

  return { isMobile, hydrated }
}

function SidebarKnob({ sidebarOpen, onToggle, isMobile }) {
  const SIDEBAR_PCT = 25

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className="fixed z-60 grid place-items-center rounded-full shadow-lg w-10 h-10 bg-white text-black border border-black/10 hover:scale-105 active:opacity-80"
      initial={false}
      animate={
        isMobile
          ? {
              top: '15%',
              left: sidebarOpen ? 'calc(80vw - 20px)' : '12px',
              translateY: '-50%',
            }
          : {
              top: '50%',
              left: sidebarOpen ? `calc(${SIDEBAR_PCT}% - 20px)` : '12px',
              translateY: '-50%',
            }
      }
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      aria-label={
        sidebarOpen
          ? 'Tutup daftar pelajaran'
          : 'Buka daftar pelajaran'
      }
    >
      {sidebarOpen ? (
        <FaAnglesLeft className="scale-125" />
      ) : (
        <FaAnglesRight className="scale-125" />
      )}
    </motion.button>
  )
}

export default function LessonsPage() {
  const path = usePathname()
  const router = useRouter()

  const { isMobile, hydrated } = useIsMobile()

  const courseId = useMemo(() => {
    const last = path.replace(/\/+$/, '').split('/').pop() || ''
    return last
  }, [path])

  if (!courseId) notFound()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen((prev) => {
      if (prev !== false) return prev
      return isMobile ? false : true
    })
  }, [hydrated])

  const [user, setUser] = useState(null)
  const isAdmin = user?.role === 'admin'

  const [lessons, setLessons] = useState([])

  const [courseList, setCourseList] = useState([])

  const [courseIndex, setCourseIndex] = useState(null)

  const [invalidCourse, setInvalidCourse] = useState(false)

  const [activeIdx, setActiveIdx] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(null)

  const [delModalOpen, setDelModalOpen] = useState(false)
  const [delIndex, setDelIndex] = useState(null)
  const [delLoading, setDelLoading] = useState(false)

  const [isFetching, setIsFetching] = useState(true)
  const [isPageBusy, setIsPageBusy] = useState(false)

  async function refreshUser() {
    try {
      const r = await fetch('/api/auth/me', {
        cache: 'no-store',
      })
      const j = await r.json()
      setUser(j.user || null)
    } catch (err) {
      console.error('[ME_FETCH_FAIL]', err)
      setUser(null)
    }
  }

  async function refreshLessons() {
    setIsFetching(true)

    const res = await fetch(`/api/courses/${courseId}/lessons`, {
      cache: 'no-store',
    })

    if (res.status === 404) {
      setLessons([])
      setIsFetching(false)
      setInvalidCourse(true)
      return
    }

    const data = await res.json()
    const baseLessons = Array.isArray(data.lessons) ? data.lessons : []

    const withSigned = await Promise.all(
      baseLessons.map(async (l) => {
        if (!l.videoKey) {
          return { ...l, signedUrl: null }
        }
        try {
          const r = await fetch(
            `/api/upload/video-url?key=${encodeURIComponent(l.videoKey)}`
          )
          const j = await r.json()
          if (r.ok && j.url) {
            return { ...l, signedUrl: j.url }
          }
        } catch (e) {
          console.error('signed url fail', e)
        }
        return { ...l, signedUrl: null }
      })
    )

    setLessons(withSigned)
    setIsFetching(false)
  }

  async function refreshCourseList() {
    const res = await fetch('/api/courses', {
      cache: 'no-store',
    })
    const data = await res.json()
    const list = Array.isArray(data.courses) ? data.courses : []

    list.sort((a, b) => {
      const ai = a.orderIndex ?? 9999
      const bi = b.orderIndex ?? 9999
      return ai - bi
    })

    setCourseList(list)
    const idx = list.findIndex((c) => c.id === courseId)
    setCourseIndex(idx >= 0 ? idx : null)
    if (idx < 0) {
      setInvalidCourse(true)
    }
  }

  useEffect(() => {
    setLessons([])
    setActiveIdx(0)
    setIsFetching(true)
    setInvalidCourse(false)
    refreshUser()
    refreshLessons()
    refreshCourseList()
  }, [courseId])

  useEffect(() => {
    if (invalidCourse) {
      notFound()
    }
  }, [invalidCourse])

  async function markAsWatched(idx) {
    const lesson = lessons[idx]
    if (!lesson) return
    if (lesson.watchedByMe) return

    setLessons((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, watchedByMe: true } : l))
    )

    try {
      const res = await fetch(
        `/api/courses/${courseId}/lessons/${lesson.id}/watched`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ positionS: 9999, event: 'completed' }),
        }
      )

      if (!res.ok) throw new Error('Mark failed')

      setTimeout(() => refreshLessons(), 1000)
    } catch (err) {
      console.error(err)
      setLessons((prev) =>
        prev.map((l, i) => (i === idx ? { ...l, watchedByMe: false } : l))
      )
    }
  }

  function addVideo() {
    if (!isAdmin) return
    setEditIndex(null)
    setModalOpen(true)
  }

  function editVideo(i) {
    if (!isAdmin) return
    setEditIndex(i)
    setModalOpen(true)
  }

  function askDeleteVideo(i) {
    if (!isAdmin) return
    setDelIndex(i)
    setDelModalOpen(true)
    setDelLoading(false)
  }

  async function confirmDeleteVideo() {
    if (delIndex == null) {
      setDelModalOpen(false)
      return
    }

    const target = lessons[delIndex]
    if (!target) {
      setDelModalOpen(false)
      return
    }

    setDelLoading(true)

    await fetch(`/api/courses/${courseId}/lessons/${target.id}`, {
      method: 'DELETE',
    })

    await refreshLessons()
    setActiveIdx(0)
    setDelLoading(false)
    setDelModalOpen(false)
    setDelIndex(null)
  }

  async function saveVideo({ title, description, videoKey }) {
    setIsPageBusy(true)

    const isEdit = editIndex != null && lessons[editIndex] != null

    if (isEdit) {
      const lessonId = lessons[editIndex].id
      await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          videoKey,
        }),
      })
    } else {
      await fetch(`/api/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          videoKey,
        }),
      })
    }

    await refreshLessons()

    if (!isEdit) {
      setActiveIdx((_) => lessons.length)
    }

    setIsPageBusy(false)
    setModalOpen(false)
  }

  const hasPrevCourse = courseIndex != null && courseIndex > 0
  const hasNextCourse =
    courseIndex != null && courseIndex < courseList.length - 1

  const goPrevCourse = () => {
    if (!hasPrevCourse) return
    const prevCourse = courseList[courseIndex - 1]
    if (prevCourse) {
      router.push(`/courses/lessons/${prevCourse.id}`)
    }
  }

  const goNextCourse = () => {
    if (!hasNextCourse) return
    const nextCourse = courseList[courseIndex + 1]
    if (nextCourse) {
      router.push(`/courses/lessons/${nextCourse.id}`)
    }
  }

  const nextDisabled = lessons.length === 0 || activeIdx >= lessons.length - 1
  const prevDisabled = activeIdx <= 0

  const goNextLesson = async () => {
    if (nextDisabled) return
    await markAsWatched(activeIdx)
    setActiveIdx((i) => i + 1)
  }

  const goPrevLesson = () => {
    if (prevDisabled) return
    setActiveIdx((i) => i - 1)
  }

  const sideVariantsDesktop = {
    open: {
      width: '25%',
      opacity: 1,
      transition: { duration: 0.4 },
    },
    closed: {
      width: 0,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  }

  const sideVariantsMobile = {
    open: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 250, damping: 30 },
    },
    closed: {
      x: '-100%',
      opacity: 0,
      transition: { duration: 0.25 },
    },
  }

  const activeLesson = lessons[activeIdx]

  const totalWatched = lessons.filter((l) => l.watchedByMe).length
  const percent =
    lessons.length === 0 ? 0 : (totalWatched / lessons.length) * 100

  return (
    <div className="fixed inset-0 flex flex-col bg-cover bg-center text-white min-h-screen overflow-hidden">
      <Header sidebar={!sidebarOpen} />

      {isPageBusy && <BusyOverlay text="Processing…" />}

      <div className="relative flex flex-1">
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <>
              {isMobile ? (
                <>
                  <div
                    className="fixed inset-0 z-45 bg-black/50"
                    onClick={() => {
                      if (!isPageBusy) setSidebarOpen(false)
                    }}
                  />
                  <motion.aside
                    key="sidebar-mobile"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={sideVariantsMobile}
                    className="fixed top-0 left-0 z-50 h-full w-[80vw] max-w-[320px] flex flex-col border-r-2 border-red-200/70 bg-neutral-900/95 shadow-xl"
                  >
                    {isFetching && (
                      <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-xs text-white/60 gap-2">
                        <Spinner className="h-5 w-5 border-2" />
                        <div>Loading lessons…</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-5 border-b">
                      <h1 className="text-2xl font-bold flex items-center gap-2">
                        Lessons
                        {isFetching && <Spinner />}
                      </h1>

                      {isAdmin && (
                        <button
                          disabled={isPageBusy}
                          onClick={addVideo}
                          className="rounded-full bg-amber-500/20 p-2 hover:bg-amber-500/30 disabled:opacity-30"
                          title="Tambah Lesson"
                        >
                          <FaPlus />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                      {lessons.length === 0 && !isFetching ? (
                        <div className="text-center text-sm text-white/70 mt-10">
                          Belum ada lesson.
                        </div>
                      ) : (
                        lessons.map((l, i) => (
                          <div
                            key={l.id ?? i}
                            onClick={() => {
                              if (!isPageBusy) {
                                setActiveIdx(i)
                                setSidebarOpen(false)
                              }
                            }}
                            className={`flex justify-between items-center p-3 rounded-xl border transition cursor-pointer ${
                              activeIdx === i
                                ? 'bg-red-900/70 border-yellow-600'
                                : 'bg-red-950/60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <IoVideocamOutline />
                              <div className="flex flex-col">
                                <div className="font-semibold text-sm">
                                  {l.title || 'Untitled'}
                                </div>

                                <div className="text-[10px] text-white/70 flex items-center gap-1">
                                  {l.watchedByMe ? (
                                    <>
                                      <span className="text-yellow-400 font-semibold">
                                        Selesai
                                      </span>
                                      <span className="text-[8px] text-white/40">
                                        (watched)
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-white/60">
                                      Belum Ditonton
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isAdmin && (
                              <div className="flex gap-2">
                                <button
                                  disabled={isPageBusy}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSidebarOpen(false)
                                    editVideo(i)
                                  }}
                                  className="p-2 rounded-md bg-black/30 hover:bg-black/50 disabled:opacity-30"
                                >
                                  <FaPencilAlt />
                                </button>

                                <button
                                  disabled={isPageBusy}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSidebarOpen(false)
                                    askDeleteVideo(i)
                                  }}
                                  className="p-2 rounded-md bg-red-600/80 hover:bg-red-700 disabled:opacity-30"
                                >
                                  <FaTrashAlt />
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-4 border-t">
                      <div className="flex items-center justify-between mb-1">
                        <h2 className="font-semibold text-sm">Progress</h2>
                        <div className="text-[11px] text-white/60">
                          {lessons.length === 0
                            ? '0 / 0'
                            : `${totalWatched}/${lessons.length} watched`}
                        </div>
                      </div>

                      <div className="h-4 bg-black/40 rounded-full overflow-hidden ring-1 ring-white/10">
                        <div
                          className="h-full bg-yellow-500 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-right mt-1 text-sm">
                        {percent.toFixed(1)}%
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                        <button
                          onClick={() => {
                            goPrevCourse()
                            setSidebarOpen(false)
                          }}
                          disabled={!hasPrevCourse || isPageBusy}
                          className="rounded-lg px-3 py-2 font-semibold bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          ‹ Prev
                        </button>
                        <button
                          onClick={() => {
                            goNextCourse()
                            setSidebarOpen(false)
                          }}
                          disabled={!hasNextCourse || isPageBusy}
                          className="rounded-lg px-3 py-2 font-semibold bg-yellow-600/85 text-black hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          Next ›
                        </button>
                      </div>
                    </div>
                  </motion.aside>
                </>
              ) : (
                <motion.aside
                  key="sidebar-desktop"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sideVariantsDesktop}
                  className="relative flex flex-col border-r-2 border-red-200/70 bg-neutral-900/95"
                >
                  {isFetching && (
                    <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-xs text-white/60 gap-2">
                      <Spinner className="h-5 w-5 border-2" />
                      <div>Loading lessons…</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-5 border-b">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      Lessons
                      {isFetching && <Spinner />}
                    </h1>

                    {isAdmin && (
                      <button
                        disabled={isPageBusy}
                        onClick={addVideo}
                        className="rounded-full bg-amber-500/20 p-2 hover:bg-amber-500/30 disabled:opacity-30"
                        title="Tambah Lesson"
                      >
                        <FaPlus />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {lessons.length === 0 && !isFetching ? (
                      <div className="text-center text-sm text-white/70 mt-10">
                        Belum ada lesson.
                      </div>
                    ) : (
                      lessons.map((l, i) => (
                        <div
                          key={l.id ?? i}
                          onClick={() => {
                            if (!isPageBusy) setActiveIdx(i)
                          }}
                          className={`flex justify-between items-center p-3 rounded-xl border transition cursor-pointer ${
                            activeIdx === i
                              ? 'bg-red-900/70 border-yellow-600'
                              : 'bg-red-950/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IoVideocamOutline />
                            <div className="flex flex-col">
                              <div className="font-semibold text-sm">
                                {l.title || 'Untitled'}
                              </div>

                              <div className="text-[10px] text-white/70 flex items-center gap-1">
                                {l.watchedByMe ? (
                                  <>
                                    <span className="text-yellow-400 font-semibold">
                                      Selesai
                                    </span>
                                    <span className="text-[8px] text-white/40">
                                      (watched)
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-white/60">
                                    Belum Ditonton
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {isAdmin && (
                            <div className="flex gap-2">
                              <button
                                disabled={isPageBusy}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  editVideo(i)
                                }}
                                className="p-2 rounded-md bg-black/30 hover:bg-black/50 disabled:opacity-30"
                              >
                                <FaPencilAlt />
                              </button>

                              <button
                                disabled={isPageBusy}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  askDeleteVideo(i)
                                }}
                                className="p-2 rounded-md bg-red-600/80 hover:bg-red-700 disabled:opacity-30"
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-4 border-t">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="font-semibold text-sm">Progress</h2>
                      <div className="text-[11px] text-white/60">
                        {lessons.length === 0
                          ? '0 / 0'
                          : `${totalWatched}/${lessons.length} watched`}
                      </div>
                    </div>

                    <div className="h-4 bg-black/40 rounded-full overflow-hidden ring-1 ring-white/10">
                      <div
                        className="h-full bg-yellow-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-right mt-1 text-sm">
                      {percent.toFixed(1)}%
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={goPrevCourse}
                        disabled={!hasPrevCourse || isPageBusy}
                        className="rounded-lg px-3 py-2 text-sm font-semibold bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        ‹ Prev Course
                      </button>
                      <button
                        onClick={goNextCourse}
                        disabled={!hasNextCourse || isPageBusy}
                        className="rounded-lg px-3 py-2 text-sm font-semibold bg-yellow-600/85 text-black hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Next Course ›
                      </button>
                    </div>
                  </div>
                </motion.aside>
              )}
            </>
          )}
        </AnimatePresence>

        <div
          className={
            isMobile
              ? 'flex flex-col flex-1'
              : `flex flex-col transition-all duration-300 ${
                  sidebarOpen ? 'basis-3/4' : 'basis-full'
                }`
          }
        >
          <SidebarKnob
            sidebarOpen={sidebarOpen}
            onToggle={() => {
              if (!isPageBusy) {
                setSidebarOpen((s) => !s)
              }
            }}
            isMobile={isMobile}
          />

          <div className="h-[12%] md:h-[14%]" />
          <div className="w-full flex justify-center items-center pb-[1%] h-full">
            <div
              className={
                isMobile
                  ? 'w-[90%] aspect-video border border-yellow-600 rounded-xl overflow-hidden bg-neutral-800 relative'
                  : `${
                      sidebarOpen ? 'w-[85%]' : 'w-[62%]'
                    } aspect-video border border-yellow-600 rounded-xl overflow-hidden bg-neutral-800 relative`
              }
            >
              {isFetching && (
                <div className="absolute inset-0 bg-neutral-900/80 flex flex-col items-center justify-center text-white/60 text-xs gap-2">
                  <Spinner className="h-6 w-6 border-2" />
                  <div>Loading video…</div>
                </div>
              )}

              <VideoPlayer
                src={activeLesson?.signedUrl || undefined}
                title={activeLesson?.title}
                onEnd={() => markAsWatched(activeIdx)}
                loading={isFetching}
              />
            </div>
          </div>

          <div className="w-full border-t bg-black/90 outline-3 min-h-[40%] lg:min-h-auto outline-yellow-800/80">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3 text-[13px] md:text-base">
              <button
                onClick={goPrevLesson}
                disabled={prevDisabled || isPageBusy}
                className="rounded-xl bg-white/10 px-6 py-3 font-bold transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous Lesson
              </button>

              <div className="text-sm text-white/70 text-center flex-1">
                {lessons.length === 0
                  ? '0 / 0'
                  : `${activeIdx + 1} / ${lessons.length} • Watched: ${totalWatched}/${lessons.length}`}
              </div>

              <button
                onClick={goNextLesson}
                disabled={nextDisabled || isPageBusy}
                className="rounded-xl bg-yellow-600/85 px-6 py-3 font-bold text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next Lesson
              </button>
            </div>
          </div>
        </div>
      </div>

      <VideoModal
        open={modalOpen && isAdmin}
        initial={editIndex != null ? lessons[editIndex] : null}
        onClose={() => {
          if (!isPageBusy) setModalOpen(false)
        }}
        onSave={saveVideo}
        isDisabled={!isAdmin}
      />

      <ConfirmDeleteModal
        open={delModalOpen && isAdmin}
        lessonTitle={
          delIndex != null && lessons[delIndex]
            ? lessons[delIndex].title
            : ''
        }
        loading={delLoading}
        onCancel={() => {
          if (!delLoading) {
            setDelModalOpen(false)
            setDelIndex(null)
          }
        }}
        onConfirm={confirmDeleteVideo}
      />
    </div>
  )
}
