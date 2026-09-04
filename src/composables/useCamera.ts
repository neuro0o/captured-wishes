import { onUnmounted, ref } from 'vue'

export type CameraFacingMode = 'user' | 'environment'
export type CameraError = 'unsupported' | 'denied'

export function useCamera() {
  const videoRef = ref<HTMLVideoElement | null>(null)
  const isReady = ref(false)
  const error = ref<CameraError | null>(null)
  const facingMode = ref<CameraFacingMode>('environment')

  let stream: MediaStream | null = null

  function stop() {
    stream?.getTracks().forEach((track) => track.stop())
    stream = null
    isReady.value = false
  }

  async function start() {
    stop()
    error.value = null

    if (!navigator.mediaDevices?.getUserMedia) {
      error.value = 'unsupported'
      return
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode.value },
        audio: false,
      })
      if (videoRef.value) {
        videoRef.value.srcObject = stream
        await videoRef.value.play()
      }
      isReady.value = true
    } catch {
      error.value = 'denied'
    }
  }

  async function flip() {
    facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
    await start()
  }

  function capture(): Promise<Blob | null> {
    const video = videoRef.value
    if (!video || !video.videoWidth) return Promise.resolve(null)

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return Promise.resolve(null)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'))
  }

  onUnmounted(stop)

  return { videoRef, isReady, error, facingMode, start, stop, flip, capture }
}
