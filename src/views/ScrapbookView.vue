<script setup lang="ts">
import { useObjectUrl } from '@vueuse/core'
import confetti from 'canvas-confetti'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import PolaroidFrame from '@/components/polaroid/PolaroidFrame.vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { MEMORY_PROMPTS, SCRAPBOOK_CLOSING } from '@/content/memories.config'
import { useMemoriesStore } from '@/stores/memories'
import type { MemoryId } from '@/types/memory'
import { getResumeRoute } from '@/utils/progress'

const router = useRouter()
const memoriesStore = useMemoriesStore()
const reducedMotion = useReducedMotion()

const CARD_ROTATIONS = [-6, 4, -5]

const photoUrls = new Map(
  MEMORY_PROMPTS.map((prompt) => [
    prompt.id,
    useObjectUrl(computed(() => memoriesStore.records[prompt.id]?.photoBlob ?? null)),
  ]),
)

const memoryCards = computed(() =>
  MEMORY_PROMPTS.map((prompt, index) => ({
    id: prompt.id,
    emoji: prompt.emoji,
    photoUrl: photoUrls.get(prompt.id)?.value ?? null,
    rotation: CARD_ROTATIONS[index % CARD_ROTATIONS.length],
  })),
)

// Module-level so a celebration only plays once per app session, not on every revisit.
let hasCelebrated = false

onMounted(async () => {
  await memoriesStore.load()
  const target = getResumeRoute(memoriesStore.records)
  if (target.name !== 'scrapbook') {
    router.replace(target)
    return
  }

  if (!hasCelebrated && !reducedMotion.value) {
    hasCelebrated = true
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.4 }, colors: ['#e8b9be', '#a9bfa0', '#c6b8d9', '#edd8a0'] })
    window.setTimeout(() => {
      confetti({ particleCount: 60, spread: 100, origin: { y: 0.5 }, colors: ['#aacbdd', '#e8b9be', '#edd8a0'] })
    }, 250)
  } else {
    hasCelebrated = true
  }
})

function viewWish(id: MemoryId) {
  router.push({ name: 'wish', params: { id } })
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center px-4 py-10">
    <div
      class="relative w-full max-w-xl overflow-hidden rounded-4xl bg-warm-white px-6 py-12 text-center shadow-[0_20px_45px_-20px_rgba(74,63,53,0.25)]"
    >
      <p class="text-sm tracking-[0.3em] text-ink/60 uppercase">Every wish, unlocked</p>
      <h1 class="mb-8 text-5xl text-ink">Captured Wishes</h1>

      <div class="mb-10 flex flex-wrap justify-center gap-x-4 gap-y-6">
        <button
          v-for="card in memoryCards"
          :key="card.id"
          type="button"
          class="cursor-pointer touch-manipulation border-0 bg-transparent p-0 transition active:scale-95"
          @click="viewWish(card.id)"
        >
          <PolaroidFrame
            :image-url="card.photoUrl"
            :rotation="card.rotation"
            :caption="card.emoji"
            width-class="w-32 sm:w-36"
          />
        </button>
      </div>

      <div class="border-t border-ink/10 pt-8">
        <h2 class="text-3xl text-ink">{{ SCRAPBOOK_CLOSING.heading }}</h2>
        <p class="mt-2 font-heading text-xl text-ink/70">{{ SCRAPBOOK_CLOSING.signature }}</p>
      </div>
    </div>
  </main>
</template>
