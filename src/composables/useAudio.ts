import { ref } from 'vue'

/**
 * App-wide sound. A module-level singleton, not a per-component composable —
 * the background music has to survive route changes, so its state can't live
 * inside a view.
 *
 * Web Audio (not <audio> elements) buys two things that matter here:
 *  - gapless looping for the music beds (an <audio loop> clicks at the seam
 *    in several browsers; an AudioBufferSourceNode with `loop = true` does not),
 *  - a per-cue GainNode so each sound can be pinned to the "very subtle" level
 *    the product spec calls for, without re-exporting the source files.
 *
 * Nothing here runs until the user turns a toggle on: that tap is the user
 * gesture that unlocks the AudioContext under mobile autoplay policies. SFX and
 * music are switched independently (`setSfxEnabled` / `setMusicEnabled`).
 */

type SfxName =
  | 'camera-shutter'
  | 'puzzle-start'
  | 'puzzle-rotate'
  | 'puzzle-solved-snap'
  | 'puzzle-finished'
  | 'note-unfold'

type MusicName = 'main-theme' | 'all-complete'

/** Per-cue playback gain (0–1). Tuned low on purpose — see the spec's Sound section. */
const SFX_GAIN: Record<SfxName, number> = {
  'camera-shutter': 0.55,
  'puzzle-start': 0.5,
  'puzzle-rotate': 0.3,
  'puzzle-solved-snap': 0.45,
  'puzzle-finished': 0.6,
  'note-unfold': 0.5,
}

const MUSIC_GAIN: Record<MusicName, number> = {
  'main-theme': 0.22,
  'all-complete': 0.3,
}

const MUSIC_FADE = 0.6 // seconds, crossfade between beds / in on start / out on stop

const SFX_NAMES = Object.keys(SFX_GAIN) as SfxName[]

function fileUrl(name: string): string {
  // `base: './'` in vite.config + hash routing means a relative URL resolves
  // against index.html's directory on both root and subpath (GitHub Pages) deploys.
  return `${import.meta.env.BASE_URL}sfx/${name}.mp3`
}

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
const buffers = new Map<string, AudioBuffer>()
const loading = new Map<string, Promise<AudioBuffer | null>>()

// Two independent switches — the recipient can silence the music but keep the
// interaction cues, or vice versa.
let sfxEnabled = false
let musicEnabled = false
let currentMusic: { name: MusicName; source: AudioBufferSourceNode; gain: GainNode } | null = null
// Bumped by every startMusic/stopMusic call so a slow buffer load that resolves
// after a newer request knows it's stale and bails.
let musicToken = 0
// The bed we want playing. Kept so that when sound is on from a persisted
// preference (no gesture yet this session, so the AudioContext can't leave
// `suspended`), the first tap anywhere can start the right track.
let pendingMusic: MusicName | null = null
let gestureArmed = false

const GESTURE_EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const

function armFirstGestureResume(): void {
  if (gestureArmed || typeof window === 'undefined') return
  gestureArmed = true
  const handler = () => {
    for (const evt of GESTURE_EVENTS) window.removeEventListener(evt, handler)
    gestureArmed = false
    unlockAudio()
    if (musicEnabled && pendingMusic) startMusic(pendingMusic)
  }
  for (const evt of GESTURE_EVENTS) {
    window.addEventListener(evt, handler, { once: true, passive: true })
  }
}

/** Exposed mainly so a dev overlay / tests can see the graph was created. */
export const audioReady = ref(false)

function ensureContext(): AudioContext | null {
  if (ctx) return ctx
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  masterGain = ctx.createGain()
  masterGain.gain.value = 1
  masterGain.connect(ctx.destination)
  audioReady.value = true
  return ctx
}

async function loadBuffer(name: string): Promise<AudioBuffer | null> {
  if (buffers.has(name)) return buffers.get(name)!
  const existing = loading.get(name)
  if (existing) return existing

  const promise = (async () => {
    const audioCtx = ensureContext()
    if (!audioCtx) return null
    try {
      const res = await fetch(fileUrl(name))
      if (!res.ok) return null
      const data = await res.arrayBuffer()
      const decoded = await audioCtx.decodeAudioData(data)
      buffers.set(name, decoded)
      return decoded
    } catch {
      return null // a missing/undecodable sound file must never break the app
    } finally {
      loading.delete(name)
    }
  })()

  loading.set(name, promise)
  return promise
}

/**
 * Unlock + warm the audio graph. Call this synchronously from the click handler
 * of the sound toggle — doing it inside the gesture is what satisfies the mobile
 * autoplay policy. Idempotent.
 */
export function unlockAudio(): void {
  const audioCtx = ensureContext()
  if (audioCtx?.state === 'suspended') void audioCtx.resume()
}

/** Toggle interaction cues. On: unlock + preload the one-shots. */
export function setSfxEnabled(on: boolean): void {
  sfxEnabled = on
  if (on) {
    unlockAudio()
    for (const name of SFX_NAMES) void loadBuffer(name)
  }
}

/** Toggle the background music bed. Off: fade it out. On: the caller starts a bed. */
export function setMusicEnabled(on: boolean): void {
  musicEnabled = on
  if (on) unlockAudio()
  else stopMusic()
}

export function playSfx(name: SfxName): void {
  if (!sfxEnabled) return
  const audioCtx = ensureContext()
  if (!audioCtx) return
  if (audioCtx.state === 'suspended') void audioCtx.resume()

  void (async () => {
    const buffer = buffers.get(name) ?? (await loadBuffer(name))
    if (!buffer || !sfxEnabled || !audioCtx || !masterGain) return
    const source = audioCtx.createBufferSource()
    source.buffer = buffer
    const gain = audioCtx.createGain()
    gain.gain.value = SFX_GAIN[name]
    source.connect(gain).connect(masterGain)
    source.start()
    source.onended = () => {
      source.disconnect()
      gain.disconnect()
    }
  })()
}

function fadeOutAndStop(music: { source: AudioBufferSourceNode; gain: GainNode }): void {
  if (!ctx) return
  const now = ctx.currentTime
  music.gain.gain.cancelScheduledValues(now)
  music.gain.gain.setValueAtTime(music.gain.gain.value, now)
  music.gain.gain.linearRampToValueAtTime(0, now + MUSIC_FADE)
  try {
    music.source.stop(now + MUSIC_FADE + 0.05)
  } catch {
    // already stopped — fine
  }
}

/**
 * Start (or crossfade to) a looping music bed. No-op if that bed is already the
 * one playing. Safe to call before music is enabled — it just won't start.
 */
export function startMusic(name: MusicName): void {
  if (!musicEnabled) return
  pendingMusic = name
  if (currentMusic?.name === name) return
  const audioCtx = ensureContext()
  if (!audioCtx) return
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume()
    // May still be locked (no user gesture yet) — pick it up on the first tap.
    armFirstGestureResume()
  }

  const token = ++musicToken
  const outgoing = currentMusic
  currentMusic = null

  void (async () => {
    const buffer = await loadBuffer(name)
    // Stale (music toggled off, or a newer startMusic/stopMusic superseded us).
    if (token !== musicToken || !buffer || !musicEnabled || !audioCtx || !masterGain) return
    if (outgoing) fadeOutAndStop(outgoing)

    const now = audioCtx.currentTime
    const source = audioCtx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const gain = audioCtx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(MUSIC_GAIN[name], now + MUSIC_FADE)
    source.connect(gain).connect(masterGain)
    source.start()
    currentMusic = { name, source, gain }
  })()
}

export function stopMusic(): void {
  musicToken++ // abort any in-flight startMusic
  pendingMusic = null
  const playing = currentMusic
  currentMusic = null
  if (playing) fadeOutAndStop(playing)
}
