<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { unlockAudio } from '@/composables/useAudio'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const { sfxEnabled, musicEnabled } = storeToRefs(settingsStore)

// The tap itself is the user gesture that unlocks audio playback under mobile
// autoplay policies — unlock synchronously here, inside the gesture, before the
// (async) store write and the watchers in App.vue that start playback.
function toggleSfx() {
  unlockAudio()
  settingsStore.toggleSfx()
}

function toggleMusic() {
  unlockAudio()
  settingsStore.toggleMusic()
}

const btn =
  'grid h-11 w-11 place-items-center rounded-2xl border-[2.5px] border-ink bg-warm-white text-ink shadow-craft-soft transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none aria-[pressed=false]:bg-cream aria-[pressed=false]:text-ink/45'
</script>

<template>
  <div class="absolute top-4 right-4 z-30 flex gap-2">
    <button
      type="button"
      :aria-pressed="sfxEnabled"
      :aria-label="sfxEnabled ? 'Sound effects on' : 'Sound effects off'"
      :title="sfxEnabled ? 'Sound effects on' : 'Sound effects off'"
      :class="[btn, '-rotate-3']"
      @click="toggleSfx"
    >
      <svg
        v-if="sfxEnabled"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        <path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
      </svg>
      <svg
        v-else
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        <path d="M17 9l5 6M22 9l-5 6" />
      </svg>
    </button>

    <button
      type="button"
      :aria-pressed="musicEnabled"
      :aria-label="musicEnabled ? 'Music on' : 'Music off'"
      :title="musicEnabled ? 'Music on' : 'Music off'"
      :class="[btn, 'rotate-2']"
      @click="toggleMusic"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M9 17V5l11-2v12" />
        <circle cx="6" cy="17" r="3" />
        <circle cx="17" cy="15" r="3" />
        <path v-if="!musicEnabled" d="M3 3l18 18" />
      </svg>
    </button>
  </div>
</template>
