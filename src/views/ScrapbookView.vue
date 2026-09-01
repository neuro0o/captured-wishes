<script setup lang="ts">
import { useObjectUrl } from '@vueuse/core'
import confetti from 'canvas-confetti'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import PolaroidFrame from '@/components/polaroid/PolaroidFrame.vue'
import ConfettiBits from '@/components/ui/ConfettiBits.vue'
import CraftScreen from '@/components/ui/CraftScreen.vue'
import Doodle from '@/components/ui/Doodle.vue'
import MarkerText from '@/components/ui/MarkerText.vue'
import PhotoCorners from '@/components/ui/PhotoCorners.vue'
import PromptIcon from '@/components/ui/PromptIcon.vue'
import WashiTape from '@/components/ui/WashiTape.vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { MEMORY_PROMPTS, SCRAPBOOK_CLOSING } from '@/content/memories.config'
import { useMemoriesStore } from '@/stores/memories'
import type { MemoryId } from '@/types/memory'
import { getResumeRoute } from '@/utils/progress'

const router = useRouter()
const memoriesStore = useMemoriesStore()
const reducedMotion = useReducedMotion()

const CARD_ROTATIONS = [-8, 5, -6]
const TAPE_COLORS = ['sky', 'dusty-pink', 'soft-yellow'] as const

const photoUrls = new Map(
  MEMORY_PROMPTS.map((prompt) => [
    prompt.id,
    useObjectUrl(computed(() => memoriesStore.records[prompt.id]?.photoBlob ?? null)),
  ]),
)

const memoryCards = computed(() =>
  MEMORY_PROMPTS.map((prompt, index) => ({
    id: prompt.id,
    photoUrl: photoUrls.get(prompt.id)?.value ?? null,
    rotation: CARD_ROTATIONS[index % CARD_ROTATIONS.length],
    tape: TAPE_COLORS[index % TAPE_COLORS.length],
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
  <CraftScreen tint="cream">
    <ConfettiBits />

    <!-- torn banner -->
    <div class="torn-bottom relative -mx-7 min-h-[124px] bg-soft-yellow">
      <WashiTape color="lavender" pattern="solid" :rotation="-15" :length="118" class="absolute -left-4 top-3" />
      <WashiTape color="dusty-pink" pattern="gingham" :rotation="16" :length="110" class="absolute -right-4 top-2" />
    </div>

    <div class="relative -mt-16 flex flex-1 flex-col items-center pb-10 sm:justify-center">
      <div class="relative -rotate-2">
        <h1 class="text-[38px]"><MarkerText color="warm-white">Captured Wishes</MarkerText></h1>
      </div>
      <p class="mt-2 rotate-[1.5deg] border border-dashed border-ink/30 bg-warm-white px-3 py-1 text-[8.5px] tracking-[0.18em] text-ink/70 uppercase shadow-craft-soft">
        Every wish, unlocked
      </p>

      <div class="relative mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-8">
        <button
          v-for="card in memoryCards"
          :key="card.id"
          type="button"
          class="relative cursor-pointer touch-manipulation border-0 bg-transparent p-0 transition active:scale-95"
          @click="viewWish(card.id)"
        >
          <PolaroidFrame
            :image-url="card.photoUrl"
            :rotation="card.rotation"
            width-class="w-28"
          >
            <WashiTape :color="card.tape" :rotation="-9" :length="60" class="absolute -top-2.5 left-1/2 -translate-x-1/2" />
            <PhotoCorners :corners="['tl']" :size="12" :inset="3" />
            <PromptIcon :id="card.id" :size="24" class="absolute -bottom-2 -right-2" />
          </PolaroidFrame>
        </button>

        <Doodle name="star" class="absolute -top-2 right-4 rotate-12 text-ink" width="18" height="18" />
        <Doodle name="heart" class="absolute bottom-2 left-2 text-dusty-pink" width="15" height="15" />
        <span class="absolute -right-1 bottom-8 rotate-6 font-heading text-base text-dusty-pink">yay!</span>
      </div>

      <div class="mt-12 flex flex-col items-center">
        <svg width="230" height="12" viewBox="0 0 230 12" fill="none" stroke="rgba(74,63,53,0.3)" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          <path d="M4 6h222" stroke-dasharray="2 7" />
        </svg>
        <div class="mt-4 flex items-center gap-2">
          <MarkerText as="h2" color="soft-yellow" class="text-3xl">{{ SCRAPBOOK_CLOSING.heading }}</MarkerText>
          <Doodle name="heart" class="text-dusty-pink" width="22" height="22" />
        </div>
        <p class="mt-1 font-hand text-xl text-ink/70">{{ SCRAPBOOK_CLOSING.signature }}</p>

        <span class="mt-4 -rotate-1 border border-dashed border-ink/30 bg-cream px-3 py-1.5 text-[10px] text-ink/50 shadow-craft-soft">
          tap a photo to revisit its wish
        </span>
      </div>
    </div>
  </CraftScreen>
</template>
