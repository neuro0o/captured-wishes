<script setup lang="ts">
import { onMounted } from 'vue'

import { useMemoriesStore } from '@/stores/memories'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const memoriesStore = useMemoriesStore()

onMounted(() => {
  settingsStore.load()
  memoriesStore.load()
})
</script>

<template>
  <div class="min-h-screen bg-cream text-ink">
    <router-view />
  </div>
</template>
