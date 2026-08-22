const MAX_DIMENSION = 1024
const QUALITY = 0.85

/**
 * Normalizes orientation (via `imageOrientation: 'from-image'`, which reads
 * EXIF so camera-roll uploads aren't sideways), downsizes to a max edge of
 * 1024px, and re-encodes as WebP to keep IndexedDB storage small.
 */
export async function processPhotoBlob(input: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(input, { imageOrientation: 'from-image' })

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image encoding failed'))),
      'image/webp',
      QUALITY,
    )
  })
}
