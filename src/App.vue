<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { useMemoriesStore } from '@/stores/memories'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const settingsStore = useSettingsStore()
const memoriesStore = useMemoriesStore()

onMounted(() => {
  settingsStore.load()
  memoriesStore.load()
})
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
