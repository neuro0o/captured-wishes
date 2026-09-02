<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import { setMusicEnabled, setSfxEnabled, startMusic } from '@/composables/useAudio'
import { useMemoriesStore } from '@/stores/memories'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const settingsStore = useSettingsStore()
const memoriesStore = useMemoriesStore()

onMounted(() => {
  settingsStore.load()
  memoriesStore.load()
})

// The scrapbook screen swaps the main theme for the celebration bed; every
// other screen plays the theme. Music only runs while it's enabled.
const musicForRoute = (name: unknown) =>
  name === 'scrapbook' ? 'all-complete' : 'main-theme'

// `immediate` because both prefs now default on: `store.load()` often leaves the
// value unchanged, so a plain watcher would never fire on startup. The audio
// layer stays silent until the AudioContext is unlocked by the first gesture
// (`startMusic` arms a one-shot listener for that).
watch(
  () => settingsStore.sfxEnabled,
  (on) => setSfxEnabled(on),
  { immediate: true },
)

watch(
  () => settingsStore.musicEnabled,
  (on) => {
    setMusicEnabled(on)
    if (on) startMusic(musicForRoute(route.name))
  },
  { immediate: true },
)

watch(
  () => route.name,
  (name) => {
    if (settingsStore.musicEnabled) startMusic(musicForRoute(name))
  },
)
</script>

<template>
  <div class="min-h-screen bg-cream text-ink">
    <!--
      Keyed by path: routes like /capture/:id reuse the same component
      instance when only the param changes (e.g. navigating capture/1 ->
      capture/2 directly), which left local view state — camera phase,
      captured blobs — stuck from the previous memory. Forcing a fresh
      instance per path is simpler than every view manually resetting
      its own state on a route-param watcher.
    -->
    <router-view :key="route.fullPath" />
  </div>
</template>
