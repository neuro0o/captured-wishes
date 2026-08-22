<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useMemoriesStore } from '@/stores/memories'
import { getResumeRoute } from '@/utils/progress'

const router = useRouter()
const memoriesStore = useMemoriesStore()

onMounted(async () => {
  await memoriesStore.load()
  const target = getResumeRoute(memoriesStore.records)
  if (target.name !== 'scrapbook') {
    router.replace(target)
  }
})
</script>

<template>
  <main class="flex min-h-screen items-center justify-center px-6 text-center">
    <p class="text-2xl">Scrapbook view</p>
  </main>
</template>
