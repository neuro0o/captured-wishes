<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const { soundEnabled } = storeToRefs(settingsStore)

// The tap itself is the user gesture that unlocks audio playback under
// mobile autoplay policies — even though nothing plays yet.
function toggle() {
  settingsStore.toggleSound()
}
</script>

<template>
  <button
    type="button"
    :aria-pressed="soundEnabled"
    :aria-label="soundEnabled ? 'Sound on' : 'Sound off'"
    :title="soundEnabled ? 'Sound on' : 'Sound off'"
    class="absolute top-4 right-4 z-30 grid h-11 w-11 -rotate-3 place-items-center rounded-2xl border-[2.5px] border-ink bg-warm-white text-ink shadow-craft-soft transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    @click="toggle"
  >
    <svg
      v-if="soundEnabled"
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
</template>
