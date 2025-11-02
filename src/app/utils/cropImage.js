export default async function getCroppedImg(imageSrc, pixelCrop, rotation = 0, quality = 0.92) {
  if (!pixelCrop) throw new Error('pixelCrop is null');

  const image = await createImage(imageSrc);

  const outW = Math.max(1, Math.round(pixelCrop.width));
  const outH = Math.max(1, Math.round(pixelCrop.height));
  const sx   = Math.max(0, Math.round(pixelCrop.x));
  const sy   = Math.max(0, Math.round(pixelCrop.y));

  if (!rotation || Math.abs(rotation % 360) < 0.0001) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    canvas.width = outW;
    canvas.height = outH;

    ctx.drawImage(image, sx, sy, outW, outH, 0, 0, outW, outH);

    return canvas.toDataURL('image/jpeg', quality);
  }

  const safeArea = Math.max(image.width, image.height) * 2;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    (safeArea - image.width) / 2,
    (safeArea - image.height) / 2
  );

  let data;
  try {
    data = ctx.getImageData(0, 0, safeArea, safeArea);
  } catch (err) {
    console.error('[crop] getImageData failed:', err);
    const fallback = document.createElement('canvas');
    const fctx = fallback.getContext('2d', { willReadFrequently: true });
    fallback.width = outW;
    fallback.height = outH;
    fctx.drawImage(image, sx, sy, outW, outH, 0, 0, outW, outH);
    return fallback.toDataURL('image/jpeg', quality);
  }

  canvas.width = outW;
  canvas.height = outH;

  ctx.putImageData(
    data,
    Math.round(-sx + (safeArea - image.width) / 2),
    Math.round(-sy + (safeArea - image.height) / 2)
  );

  return canvas.toDataURL('image/jpeg', quality);
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = async () => {
      if ('decode' in img) {
        try { await img.decode(); } catch {}
      }
      resolve(img);
    };

    img.onerror = (e) => reject(e);

    if (/^https?:\/\//i.test(url)) img.crossOrigin = 'anonymous';

    img.src = url;
  });
}
