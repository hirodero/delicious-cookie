'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '@/app/components/ui/header'
import { FaPencil, FaTrash, FaPlus } from 'react-icons/fa6'
import { FaAngleDoubleUp, FaAngleDoubleDown } from 'react-icons/fa'
import { IoSearch } from 'react-icons/io5'
import { motion, AnimatePresence } from 'framer-motion'
import { Admin as CropperModal } from '../components/ui/upload'

function TinySpinner({ className = '' }) {
  return (
    <div
      className={
        'h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-yellow-400 ' +
        className
      }
    />
  )
}

function CardSkeleton() {
  return (
    <div className="relative border outline-3 outline-yellow-800/80 border-red-200/70 rounded-xl bg-black/40 overflow-hidden">
      <div
        className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_40%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0)_60%,rgba(255,255,255,0)_100%)] animate-[shimmer_1.5s_infinite] opacity-40 pointer-events-none"
        style={{ backgroundSize: '200% 100%' }}
      />

      <div className="w-full aspect-video rounded-t-xl bg-neutral-800/70" />

      <div className="w-full border-y-2 border-yellow-700 bg-red-950/80">
        <div className="h-6 md:h-8 xl:h-10 w-2/3 bg-white/10 rounded-md m-3" />
      </div>

      <div className="bg-neutral-900 p-4 space-y-2">
        <div className="h-3 w-full bg-white/10 rounded" />
        <div className="h-3 w-5/6 bg-white/10 rounded" />
        <div className="h-3 w-3/5 bg-white/10 rounded" />
      </div>

      <div className="flex items-center w-full p-3 bg-yellow-600/40 rounded-b-xl">
        <div className="h-[52px] w-[52px] bg-yellow-900/70 rounded-full border border-yellow-800/80 outline-3 outline-yellow-800/80" />
        <div className="flex-1 ml-3 space-y-2">
          <div className="h-2 bg-yellow-900/40 rounded-full" />
          <div className="h-2 bg-yellow-900/40 rounded-full w-1/2" />
        </div>
      </div>
    </div>
  )
}

function ConfirmDeleteModal({
  open,
  itemTitle,
  loading,
  onCancel,
  onConfirm,
}) {
  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-80 bg-black/70 backdrop-blur-[2px]"
        onClick={() => {
          if (!loading) onCancel()
        }}
      />

      <div className="fixed inset-0 z-90 grid place-items-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-neutral-900 text-neutral-100 ring-1 ring-white/10 overflow-hidden shadow-xl shadow-black/60 border border-white/10">
          <div className="px-5 py-4 border-b border-white/10 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-red-400 ring-1 ring-red-500/40 text-lg font-bold">
              <FaTrash />
            </div>
            <div className="flex flex-col">
              <div className="text-base font-semibold text-white">
                Delete course?
              </div>
              <div className="text-xs text-white/60 leading-relaxed">
                {`"${itemTitle}" akan dihapus secara permanen dari daftar course.`}
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
                  <TinySpinner />
                  <span>Deleting…</span>
                </>
              ) : (
                <>
                  <FaTrash />
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

function CardEditor({
  open,
  item,
  onClose,
  onSave,
  onAskDelete,
}) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [desc, setDesc] = useState(item?.description ?? '')
  const [thumb, setThumb] = useState(item?.thumbnailUrl ?? null)

  const [showCrop, setShowCrop] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [thumbError, setThumbError] = useState('')

  useEffect(() => {
    setTitle(item?.title ?? '')
    setDesc(item?.description ?? '')
    setThumb(item?.thumbnailUrl ?? null)
    setThumbError('')
  }, [item])

  if (!open) return null

  async function handleThumbFromCrop(dataUrl) {
    try {
      setUploadingThumb(true)
      setThumbError('')

      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'thumbnail.jpg', {
        type: blob.type || 'image/jpeg',
      })

      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/upload/thumbnail', {
        method: 'POST',
        body: form,
      })

      const out = await res.json()
      if (!res.ok) {
        setThumbError(out?.error || 'Upload thumbnail gagal')
        return
      }

      setThumb(out.url)
      setShowCrop(false)
    } catch (err) {
      setThumbError('Upload thumbnail gagal')
    } finally {
      setUploadingThumb(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={() => {
          if (!uploadingThumb) onClose()
        }}
      />

      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="w-full max-w-3xl rounded-2xl bg-neutral-900 text-neutral-100 ring-1 ring-white/10 overflow-hidden shadow-xl shadow-black/60 border border-white/10">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <h3 className="text-lg font-semibold">
              {item ? 'Edit Course Card' : 'Add Course Card'}
            </h3>
            <button
              onClick={onClose}
              disabled={uploadingThumb}
              className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✕
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 p-5">
            <div className="space-y-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl ring-1 ring-white/10 bg-black">
                {thumb ? (
                  <img
                    src={thumb}
                    alt="thumb"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-sm text-white/60 bg-neutral-950">
                    Belum ada gambar
                  </div>
                )}

                {uploadingThumb && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 backdrop-blur-[2px] text-[11px] text-white/80 font-semibold">
                    <TinySpinner className="h-6 w-6 border-2 border-white/30 border-t-yellow-400" />
                    <div>Uploading...</div>
                    <div className="text-[10px] text-white/40 tracking-wider uppercase">
                      please wait
                    </div>
                  </div>
                )}
              </div>

              {thumbError && (
                <div className="text-[11px] font-semibold text-red-400">
                  {thumbError}
                </div>
              )}

              <button
                disabled={uploadingThumb}
                onClick={() => {
                  if (!uploadingThumb) setShowCrop(true)
                }}
                className={
                  'w-full rounded-md px-4 py-2 text-sm font-semibold transition ' +
                  (uploadingThumb
                    ? 'bg-amber-500/10 text-amber-200/40 cursor-not-allowed ring-1 ring-amber-500/30'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 ring-1 ring-amber-500/30')
                }
              >
                {uploadingThumb ? 'Uploading…' : 'Edit Picture (Crop)'}
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm opacity-80 mb-1">Title</label>
              <input
                className="w-full rounded-md bg-white/5 px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul materi…"
                disabled={uploadingThumb}
              />

              <label className="block text-sm opacity-80 mt-3 mb-1">
                Description
              </label>
              <textarea
                className="min-h-[140px] w-full resize-y rounded-md bg-white/5 px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Deskripsi singkat…"
                disabled={uploadingThumb}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-white/10">
            <button
              onClick={onClose}
              disabled={uploadingThumb}
              className="rounded-md px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>

            <div className="flex items-center gap-2">
              {!!item && (
                <button
                  onClick={() => {
                    if (!uploadingThumb) onAskDelete?.()
                  }}
                  disabled={uploadingThumb}
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTrash /> Delete
                </button>
              )}

              <button
                disabled={uploadingThumb}
                onClick={() => {
                  if (uploadingThumb) return
                  onSave({
                    title: title.trim(),
                    description: desc.trim(),
                    thumbnailUrl: thumb || null,
                  })
                }}
                className="rounded-md px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingThumb ? (
                  <div className="flex items-center gap-2">
                    <TinySpinner className="h-4 w-4 border-white/30 border-t-white" />
                    <span>Saving…</span>
                  </div>
                ) : (
                  'Simpan'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCrop && (
        <CropperModal
          onClose={() => {
            if (!uploadingThumb) setShowCrop(false)
          }}
          onSave={handleThumbFromCrop}
        />
      )}
    </>
  )
}

function SearchBar({ value, onChange, onSubmit, loading }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
      className="flex flex-row w-full justify-center items-center bg-neutral-800/95 h-10 text-white rounded-xl border outline-1 outline-yellow-800/30 border-red-200/10"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari materi (judul / deskripsi)…"
        className="w-full p-2 rounded-l-xl bg-transparent placeholder:text-md outline-none"
      />

      <button
        type="submit"
        className="flex items-center justify-center h-full px-4 bg-white text-black rounded-r-xl font-bold text-xl hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Cari"
        disabled={loading}
      >
        {loading ? (
          <div className="scale-75">
            <TinySpinner className="border-black/30 border-t-black" />
          </div>
        ) : (
          <IoSearch />
        )}
      </button>
    </form>
  )
}

function Travel({ scrollToTop, scrollToBottom }) {
  return (
    <div className="fixed flex flex-col bottom-[0%] right-0 cursor-pointer z-50 gap-4 border pb-2 pt-9 px-3 pl-5 rounded-tl-full bg-neutral-950/80">
      <button
        onClick={scrollToTop}
        className="flex w-13 h-13 justify-center items-center bg-black text-white shadow-lg rounded-full border-2 border-white transition duration-75 hover:scale-105 hover:border-yellow-600"
      >
        <FaAngleDoubleUp />
      </button>
      <button
        onClick={scrollToBottom}
        className="flex w-13 h-13 justify-center items-center bg-black text-white shadow-lg rounded-full border-2 border-white transition duration-75 hover:scale-105 hover:border-yellow-600"
      >
        <FaAngleDoubleDown />
      </button>
    </div>
  )
}

export default function Courses() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const isAdmin = user?.role === 'admin'

  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const [heroVideoKey, setHeroVideoKey] = useState(null)
  const [heroVideoPlayUrl, setHeroVideoPlayUrl] = useState(null)
  const [heroMuted, setHeroMuted] = useState(true)

  const [loadingHeroData, setLoadingHeroData] = useState(false)
  const [loadingHero, setLoadingHero] = useState(false)

  const videoFileRef = useRef(null)

  const [editor, setEditor] = useState({ open: false, index: -1 })
  const [deleteState, setDeleteState] = useState({
    open: false,
    index: -1,
    loading: false,
  })

  const bottomRef = useRef(null)
  const topRef = useRef(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const data = await res.json()
        setUser(data.user || null)
      } catch (err) {
        console.error('Failed to fetch user', err)
        setUser(null)
      } finally {
        setLoadingUser(false)
      }
    }
    fetchUser()
  }, [])

  async function fetchCourses(q = '') {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/courses${q ? `?q=${encodeURIComponent(q)}` : ''}`,
        { cache: 'no-store' }
      )
      const data = await res.json()
      setItems(data.courses ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function fetchHeroVideo() {
    setLoadingHeroData(true)
    try {
      const metaRes = await fetch('/api/platform-video', { cache: 'no-store' })
      const metaData = await metaRes.json()

      if (!metaRes.ok || !metaData.video) {
        setHeroVideoKey(null)
        setHeroVideoPlayUrl(null)
        setHeroMuted(true)
        return
      }

      const { videoKey, muted } = metaData.video
      setHeroVideoKey(videoKey || null)
      setHeroMuted(!!muted)

      if (videoKey) {
        const urlRes = await fetch(
          `/api/upload/video-url?key=${encodeURIComponent(videoKey)}`
        )
        const urlData = await urlRes.json()
        if (urlRes.ok && urlData.url) {
          setHeroVideoPlayUrl(urlData.url)
        } else {
          setHeroVideoPlayUrl(null)
        }
      } else {
        setHeroVideoPlayUrl(null)
      }
    } catch (err) {
      console.error('fetchHeroVideo error', err)
      setHeroVideoKey(null)
      setHeroVideoPlayUrl(null)
      setHeroMuted(true)
    } finally {
      setLoadingHeroData(false)
    }
  }

  useEffect(() => {
    fetchCourses()
    fetchHeroVideo()
  }, [])

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  const scrollToTop = () =>
    topRef.current?.scrollIntoView({ behavior: 'smooth' })

  const openEditor = (idx) => {
    if (!isAdmin) return
    setEditor({ open: true, index: idx })
  }
  const closeEditor = () => setEditor({ open: false, index: -1 })

  function askDeleteCourse(idx) {
    if (!isAdmin) return
    setDeleteState({
      open: true,
      index: idx,
      loading: false,
    })
  }

  function cancelDeleteCourse() {
    if (deleteState.loading) return
    setDeleteState({
      open: false,
      index: -1,
      loading: false,
    })
  }

  const saveEditor = async ({ title, description, thumbnailUrl }) => {
    if (!isAdmin) return

    const current = editor.index >= 0 ? items[editor.index] : null

    if (current) {
      const res = await fetch(`/api/courses/${current.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, thumbnailUrl }),
      })
      if (!res.ok) alert('Gagal update course')
    } else {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, thumbnailUrl }),
      })
      if (!res.ok) alert('Gagal membuat course')
    }

    await fetchCourses(query)
    closeEditor()
  }

  const deleteEditor = async () => {
    if (!isAdmin) return

    const modalIndex =
      deleteState.open && deleteState.index >= 0
        ? deleteState.index
        : editor.index

    const current = modalIndex >= 0 ? items[modalIndex] : null
    if (!current) {
      cancelDeleteCourse()
      closeEditor()
      return
    }

    setDeleteState((prev) => ({
      ...prev,
      loading: true,
    }))

    const res = await fetch(`/api/courses/${current.id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      alert('Gagal menghapus course')
    }

    await fetchCourses(query)

    closeEditor()
    setDeleteState({
      open: false,
      index: -1,
      loading: false,
    })
  }

  async function handleSearch() {
    await fetchCourses(query)
  }

  async function onPickVideo(e) {
    if (!isAdmin) return

    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type?.startsWith('video/')) {
      alert('Pilih file video.')
      return
    }

    try {
      setLoadingHero(true)

      const form = new FormData()
      form.append('file', f)

      const upRes = await fetch('/api/upload/video', {
        method: 'POST',
        body: form,
      })
      const upData = await upRes.json()
      if (!upRes.ok) {
        alert('Upload video gagal')
        return
      }

      const storageKey = upData.storageKey

      const saveRes = await fetch('/api/platform-video', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoKey: storageKey,
          muted: heroMuted,
        }),
      })

      if (!saveRes.ok) {
        alert('Gagal set video utama')
        return
      }

      await fetchHeroVideo()
    } finally {
      setLoadingHero(false)
    }
  }

  async function removeVideo() {
    if (!isAdmin) return
    const ok = confirm('Hapus video utama?')
    if (!ok) return

    try {
      setLoadingHero(true)
      const res = await fetch('/api/platform-video', {
        method: 'DELETE',
      })

      if (!res.ok) {
        alert('Gagal menghapus video')
        return
      }

      await fetchHeroVideo()
    } finally {
      setLoadingHero(false)
    }
  }

  async function toggleMute() {
    const newMuted = !heroMuted
    setHeroMuted(newMuted)

    if (!heroVideoKey) return

    const res = await fetch('/api/platform-video', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoKey: heroVideoKey,
        muted: newMuted,
      }),
    })

    if (!res.ok) {
      alert('Gagal update mute')
      await fetchHeroVideo()
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((it) =>
      (it.title + ' ' + (it.description ?? '')).toLowerCase().includes(q)
    )
  }, [items, query])

  const gridData = filtered

  const heroBusy = loadingHeroData || loadingHero

  return (
    <div className="flex flex-col scroll-hide fixed inset-0 min-h-screen overflow-y-auto w-full text-white bg-cover bg-fixed bg-center">
      <Header />

      <Travel scrollToTop={scrollToTop} scrollToBottom={scrollToBottom} />

      <div
        ref={topRef}
        className="flex flex-col items-center px-10 pt-25 pb-12 md:px-10 md:py-28 xl:px-20 xl:pt-22 w-full rounded-2xl border outline-3 outline-yellow-800/80 border-red-200/70 bg-linear-to-t from-black/80 via-red-600/20 to-black/80"
      >
        <div className="relative flex flex-col xl:w-[71%] w-full aspect-video rounded-2xl border outline-3 outline-yellow-800/80 border-red-200/70 overflow-hidden bg-neutral-900">
          {heroVideoPlayUrl ? (
            <video
              src={heroVideoPlayUrl}
              autoPlay
              loop
              muted={heroMuted}
              playsInline
              className="w-full h-full object-cover rounded-t-2xl
                         [::-webkit-media-controls-fullscreen-button]:hidden
                         [&::-webkit-media-controls-play-button]:hidden
                         [::-webkit-media-controls-mute-button]:block"
              controls={false}
            />
          ) : (
            <div className="relative flex justify-center items-center w-full h-full bg-neutral-800 rounded-t-2xl text-white/60 text-sm">
              <span className="text-white/60 text-xs">
                Video Placeholder
              </span>
            </div>
          )}

          {heroBusy && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 text-xs text-white/70 font-semibold z-20">
              <TinySpinner className="h-6 w-6 border-2" />
              <div>
                {loadingHero ? 'Processing video…' : 'Loading video…'}
              </div>
              <div className="text-[10px] text-white/40 tracking-wider uppercase">
                {loadingHero ? 'syncing to storage' : 'fetching source'}
              </div>
            </div>
          )}

          <div className="flex items-center w-full xl:text-3xl rounded-b-2xl text-xl xl:px-4 xl:py-2 px-4 py-1 border-y-2 border-yellow-700 font-bold break-all bg-red-950/95 scroll-hide">
            <p className="font-sail xl:text-2xl md:text-xl text-lg text-orange-400">
              CuanVerse
            </p>
          </div>

          <input
            ref={videoFileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={onPickVideo}
          />

          <div className="absolute bottom-3 right-3 z-30 flex gap-2">
            {isAdmin && (
              <button
                onClick={() => {
                  if (!heroBusy) {
                    videoFileRef.current?.click()
                  }
                }}
                className="grid place-items-center min-w-11 min-h-11 rounded-full bg-amber-500/90 text-black shadow-lg border border-yellow-500 hover:brightness-95 text-sm px-3 disabled:opacity-50"
                aria-label="Upload video"
                title="Upload / Replace Video"
                disabled={heroBusy}
              >
                <FaPlus />
              </button>
            )}

            {heroVideoKey && (
              <button
                onClick={toggleMute}
                className="grid place-items-center min-w-11 min-h-11 rounded-full bg-black/70 text-white shadow-lg border border-white/30 hover:brightness-110 text-xs px-3 disabled:opacity-40"
                aria-label="Mute toggle"
                title={heroMuted ? 'Unmute' : 'Mute'}
                disabled={heroBusy}
              >
                {heroMuted ? '🔇' : '🔊'}
              </button>
            )}

            {heroVideoKey && isAdmin && (
              <button
                onClick={removeVideo}
                className="grid place-items-center min-w-11 min-h-11 rounded-full bg-red-600/90 text-white shadow-lg border border-red-400 hover:brightness-95 text-sm px-3 disabled:opacity-40"
                aria-label="Hapus video"
                title="Hapus Video"
                disabled={heroBusy}
              >
                <FaTrash />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-linear-to-t from-black via-red-600/20 to-black px-10 pb-20 xl:px-20 xl:pb-21">
        <div className="flex flex-col w-full h-auto mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl xl:text-6xl md:text-4xl font-bold p-1 xl:p-2 min-h-15 xl:min-h-20">
              Course
            </h2>
          </div>

          <div className="pb-5">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={handleSearch}
              loading={loading}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 pt-3 gap-x-15 gap-y-6 h-auto">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <>
              {gridData.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-white/60 py-20 gap-3">
                  <div className="text-lg font-semibold text-yellow-400">
                    No course found
                  </div>
                  <div className="text-xs text-white/40 max-w-[250px] leading-relaxed">
                    Coba ubah kata kunci pencarianmu.
                    {isAdmin && ' Atau tambahkan course baru.'}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() =>
                        setEditor({ open: true, index: -1 })
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500/20 px-4 py-2 hover:bg-amber-500/30 text-sm font-semibold text-white"
                    >
                      <FaPlus /> Add New Course
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 pt-3 gap-x-15 gap-y-6 h-auto">
                  {gridData.map((item, index) => {
                    const thisIndex = items.findIndex(
                      (x) => x.id === item.id
                    )

                    return (
                      <div
                        key={item.id}
                        className="relative cursor-pointer border outline-3 backdrop-blur-3xl outline-yellow-800/80 transition duration-75 border-red-200/70 rounded-xl hover:brightness-95
                                   flex flex-col bg-black/40"
                      >
                        {isAdmin && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditor(thisIndex)
                              }}
                              className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-2 ring-1 ring-white/20 hover:bg-black/70"
                              aria-label="Edit"
                            >
                              <FaPencil />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                askDeleteCourse(thisIndex)
                              }}
                              className="absolute right-12 top-2 z-10 rounded-full bg-red-600/90 p-2 ring-1 ring-white/20 hover:bg-red-600"
                              aria-label="Delete"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}

                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0.7 }}
                            transition={{ duration: 0.2 }}
                            onClick={() =>
                              router.push(`/courses/lessons/${item.id}`)
                            }
                            className="flex flex-col w-full h-full"
                          >
                            <div className="w-full aspect-video bg-neutral-800 rounded-t-xl overflow-hidden flex items-center justify-center">
                              {item.thumbnailUrl ? (
                                <img
                                  src={item.thumbnailUrl}
                                  alt={item.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-white/60">
                                  Picture Placeholder
                                </span>
                              )}
                            </div>

                            <div className="w-full border-y-2 border-yellow-700 bg-red-950/95 font-semibold hover:text-yellow-600
                                            xl:text-2xl md:text-xl text-md
                                            xl:px-4 xl:py-6 md:px-3 md:py-3 px-2 py-2
                                            text-white leading-snug wrap-break-word">
                              {index + 1}. {item.title}
                            </div>

                            <div
                              className="bg-neutral-900 text-white font-semibold xl:text-sm text-xs
                                         px-4 pt-3 pb-5
                                         wrap-break-word leading-relaxed
                                         scroll-hide
                                         overflow-y-auto
                                         min-h-40 md:min-h-28 xl:min-h-28 max-h-40 md:max-h-32 xl:max-h-28"
                            >
                              {item.description}
                            </div>

                            <div className="bg-yellow-600/90 text-black font-bold contrast-150 brightness-125 rounded-b-xl p-3">
                              <div className="flex items-center gap-3">
                                <div className="shrink-0 bg-yellow-950 text-white text-[11px] leading-none font-bold border outline-3 outline-yellow-800/80 border-red-200/70 rounded-full px-3 py-2">
                                  {item.progressPct.toFixed(0)}%
                                </div>

                                <div className="flex-1 flex flex-col">
                                  <div className="w-full h-3 bg-yellow-900/50 border border-yellow-800/80 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-red-900 transition-all duration-500"
                                      style={{
                                        width: `${item.progressPct}%`,
                                      }}
                                    />
                                  </div>

                                  <div className="flex w-full text-[10px] text-black/80 font-extrabold tracking-tight justify-between mt-1">
                                    <span>
                                      {item.watchedLessons} /{' '}
                                      {item.totalLessons} lessons
                                    </span>
                                    <span>
                                      {item.progressPct.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    )
                  })}

                  <div ref={bottomRef} />
                </div>
              )}
            </>
          )}

          {gridData.length !== 0 && isAdmin && (
            <div className="fixed mt-6 flex left-[5%] bottom-5">
              <button
                onClick={() => setEditor({ open: true, index: -1 })}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500/60 px-4 py-2 hover:bg-amber-500/30"
                aria-label="Add card"
                title="Add Course"
              >
                <FaPlus /> Add Course
              </button>
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <CardEditor
          open={editor.open}
          item={editor.index >= 0 ? items[editor.index] : null}
          onClose={closeEditor}
          onSave={saveEditor}
          onAskDelete={() => {
            setDeleteState({
              open: true,
              index: editor.index,
              loading: false,
            })
          }}
        />
      )}

      {isAdmin && (
        <ConfirmDeleteModal
          open={deleteState.open}
          itemTitle={
            deleteState.index >= 0 && items[deleteState.index]
              ? items[deleteState.index].title
              : ''
          }
          loading={deleteState.loading}
          onCancel={cancelDeleteCourse}
          onConfirm={deleteEditor}
        />
      )}
    </div>
  )
}
