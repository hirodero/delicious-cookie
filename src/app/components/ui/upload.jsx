'use client';

import Cropper from 'react-easy-crop';
import { useEffect, useRef, useState, useCallback } from 'react';
import getCroppedImg from '../../utils/cropImage';

const ASPECT_PRESETS = [
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: '1:1',  value: 1 / 1 },
  { label: '3:4',  value: 3 / 4 },
  { label: '2:1',  value: 2 / 1 },
];

export function Admin({ onClose, onSave }) {
  const fileRef = useRef(null);

  const [objectUrl, setObjectUrl] = useState(null);
  const [imageSrc, setImageSrc]   = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(16 / 9); 

  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const apply = () => setAspect(window.innerWidth < 768 ? 9/16 : 16/9);
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, []);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setImageSrc(url);
    setPreviewUrl(null);
    setZoom(1);
    setRotate(0);
  };

  const triggerPick = () => {
    setPreviewUrl(null);
    setImageSrc(null);
    fileRef.current?.click();
  };

const showCroppedImage = useCallback(async () => {
  if (!imageSrc || !croppedAreaPixels) return null;
  try {
    setSaving(true);
    const cropped = await getCroppedImg(imageSrc, croppedAreaPixels, rotate, 0.92);
    setPreviewUrl(cropped); 
    return cropped;         
  } catch (e) {
    console.error('[crop] gagal:', e);
    return null;
  } finally {
    setSaving(false);
  }
}, [imageSrc, croppedAreaPixels, rotate]);

  const handleConfirm = async () => {
    let url = previewUrl;
    console.log(url)
    if (!url) url = await showCroppedImage();
    if (url) onSave?.(url);
  };

  useEffect(() => {
    const onKey = async (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'Enter') await handleConfirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, handleConfirm]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="mx-auto my-6 w-full max-w-[520px] rounded-2xl bg-neutral-900 text-neutral-100 shadow-2xl ring-1 ring-white/10 flex flex-col max-h-[90dvh]">
      
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-lg font-semibold tracking-wide">Crop Thumbnail</h2>
          <div className="flex items-center gap-2">
            <button onClick={triggerPick} className="rounded-md bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 text-sm font-medium">
              Ganti Gambar
            </button>
            <button onClick={onClose} className="rounded-md bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm" aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto overscroll-contain grid gap-3 p-4">

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

          <div className="relative w-full h-[min(40dvh,40vw)] min-h-[140px] overflow-hidden rounded-xl bg-black">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotate}
                aspect={aspect}
                onCropChange={setCrop}
                onRotationChange={setRotate}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid={false}
                objectFit="contain"
                zoomWithScroll
                restrictPosition
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={triggerPick} className="rounded-lg bg-amber-500/20 px-4 py-2 hover:bg-amber-500/30">
                  Pilih Gambar
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-2 rounded-xl bg-white/5 p-3">
            <label className="text-xs opacity-80">Aspect Ratio</label>
            <div className="flex flex-wrap gap-2">
              {ASPECT_PRESETS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => setAspect(a.value)}
                  className={`px-3 py-1.5 rounded-md text-sm border ${
                    aspect === a.value ? 'border-amber-400 bg-amber-500/20' : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <div className="mt-2 grid gap-2">
              <div className="flex items-center justify-between text-xs opacity-80">
                <span>Zoom</span>
                <span>{zoom.toFixed(2)}x</span>
              </div>
              <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />

              <div className="flex items-center justify-between text-xs opacity-80">
                <span>Rotate</span>
                <span>{Math.round(rotate)}°</span>
              </div>
              <input type="range" min={-180} max={180} step={1} value={rotate} onChange={(e) => setRotate(parseFloat(e.target.value))} />
            </div>

            <div className="grid gap-2">
              <p className="text-xs opacity-70">Preview</p>
              <div className="w-full aspect-video rounded-lg overflow-hidden ring-1 ring-white/10 bg-black">
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-xs opacity-60">Belum ada preview</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-white/10">
          <button onClick={triggerPick} className="rounded-md px-4 py-2 bg-white/10 hover:bg-white/20">
            Pilih Ulang
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={showCroppedImage}
              disabled={!imageSrc || !croppedAreaPixels || saving}
              className="rounded-md px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50"
            >
              {saving ? 'Memproses…' : 'Simpan Crop (Preview)'}
            </button>
            <button
              onClick={handleConfirm}
              disabled={!imageSrc}
              className="rounded-md px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold disabled:opacity-50"
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const AddVideo = () => {
  const [open, setOpen] = useState(false);
  const [lastThumb, setLastThumb] = useState(null);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-6 bottom-6 z-40 grid place-items-center w-16 h-16 rounded-full bg-black text-white text-3xl shadow-lg hover:opacity-80"
        aria-label="Tambah Video"
      >
        +
      </button>

      {open && (
        <Admin
          onClose={() => setOpen(false)}
          onSave={(dataUrl) => {
            setLastThumb(dataUrl);
            setOpen(false);
          }}
        />
      )}
    </>
  );
};
