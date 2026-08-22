<script setup lang="ts">
import { useObjectUrl } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import PuzzleBoard from '@/components/puzzle/PuzzleBoard.vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { MEMORY_PROMPTS } from '@/content/memories.config'
import { useMemoriesStore } from '@/stores/memories'
import { useSettingsStore } from '@/stores/settings'
import type { MemoryId } from '@/types/memory'
import { getMemoryStep } from '@/utils/progress'

const props = defineProps<{ id: string }>()
const memoryId = computed(() => props.id as MemoryId)
const prompt = computed(() => MEMORY_PROMPTS.find((entry) => entry.id === memoryId.value))

const router = useRouter()
const memoriesStore = useMemoriesStore()
const settingsStore = useSettingsStore()
const reducedMotion = useReducedMotion()

const gridSize = computed(() => settingsStore.gridSize ?? 3)
const photoBlob = computed(() => memoriesStore.records[memoryId.value]?.photoBlob ?? null)
const photoUrl = useObjectUrl(photoBlob)

const justSolved = ref(false)
const ready = ref(false)

onMounted(async () => {
  await memoriesStore.load()
  const step = getMemoryStep(memoriesStore.records[memoryId.value])
  if (step === 'capture') {
    router.replace({ name: 'capture', params: { id: memoryId.value } })
    return
  }
  if (step === 'wish' || step === 'done') {
    router.replace({ name: 'wish', params: { id: memoryId.value } })
    return
  }
  ready.value = true
})

async function handleSolved() {
  if (justSolved.value) return
  justSolved.value = true
  await memoriesStore.markPuzzleSolved(memoryId.value)
  window.setTimeout(
    () => {
      router.push({ name: 'wish', params: { id: memoryId.value } })
    },
    reducedMotion.value ? 200 : 1400,
  )
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center px-4 py-10">
    <div
      class="relative w-full max-w-xl overflow-hidden rounded-4xl bg-warm-white px-6 py-10 text-center shadow-[0_20px_45px_-20px_rgba(74,63,53,0.25)]"
    >
      <template v-if="prompt">
        <p class="mb-1 text-4xl">{{ prompt.emoji }}</p>
        <h1 class="mb-2 text-3xl text-ink">Piece it back together</h1>
        <p class="mb-6 text-sm text-ink/60">Drag a piece to move it, tap to spin it into place.</p>
      </template>

      <div class="flex justify-center">
        <PuzzleBoard
          v-if="ready && photoUrl"
          :image-url="photoUrl"
          :grid-size="gridSize"
          @solved="handleSolved"
        />
      </div>

      <p v-if="justSolved" class="mt-6 font-heading text-xl text-ink">You found it! ✨</p>
    </div>
  </main>
</template>
