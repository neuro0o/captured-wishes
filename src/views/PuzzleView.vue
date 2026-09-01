<script setup lang="ts">
import { useObjectUrl } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import PuzzleBoard from '@/components/puzzle/PuzzleBoard.vue'
import ConfettiBits from '@/components/ui/ConfettiBits.vue'
import CraftScreen from '@/components/ui/CraftScreen.vue'
import Doodle from '@/components/ui/Doodle.vue'
import MarkerText from '@/components/ui/MarkerText.vue'
import PhotoCorners from '@/components/ui/PhotoCorners.vue'
import ProgressFilmstrip from '@/components/ui/ProgressFilmstrip.vue'
import WashiTape from '@/components/ui/WashiTape.vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { MEMORY_PROMPTS } from '@/content/memories.config'
import { useMemoriesStore } from '@/stores/memories'
import { useSettingsStore } from '@/stores/settings'
import type { MemoryId } from '@/types/memory'
import { getResumeRoute } from '@/utils/progress'

const props = defineProps<{ id: string }>()
const memoryId = computed(() => props.id as MemoryId)
const prompt = computed(() => MEMORY_PROMPTS.find((entry) => entry.id === memoryId.value))
const currentStep = computed(() => Number(memoryId.value))

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
  const target = getResumeRoute(memoriesStore.records)
  if (target.name !== 'puzzle' || target.params.id !== memoryId.value) {
    router.replace(target)
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
  <CraftScreen tint="sage">
    <ConfettiBits v-if="justSolved" />

    <div class="relative flex flex-1 flex-col items-center gap-4 pt-14 pb-10 sm:justify-center sm:pt-10">
      <div v-if="prompt" class="relative -rotate-2">
        <MarkerText as="h1" color="soft-yellow" class="text-[27px]">Piece it back together</MarkerText>
        <Doodle name="squiggle" class="absolute -bottom-2 left-1/2 -translate-x-1/2 text-dusty-pink" width="180" height="10" />
      </div>

      <p class="rotate-[1.5deg] border border-dashed border-ink/30 bg-warm-white px-3 py-1.5 text-[10px] text-ink/70 shadow-craft-soft">
        Drag a piece to move it &nbsp;&bull;&nbsp; tap to spin it into place
      </p>

      <div class="relative mt-4 -rotate-[1.5deg] rounded-md border-4 border-ink bg-cream p-3.5 shadow-craft-lg">
        <div class="w-64">
          <PuzzleBoard
            v-if="ready && photoUrl"
            :image-url="photoUrl"
            :grid-size="gridSize"
            @solved="handleSolved"
          />
        </div>
        <WashiTape color="sky" :rotation="-8" :length="100" class="absolute -top-3 left-7" />
        <WashiTape color="soft-yellow" pattern="solid" :rotation="-5" :length="100" class="absolute -right-4 bottom-6" />
        <PhotoCorners :corners="['tl', 'br']" :size="18" :inset="4" />
        <Doodle name="spin" class="absolute -right-6 bottom-1 text-ink" width="40" height="40" />
      </div>

      <ProgressFilmstrip :current="currentStep" class="mt-5" />

      <div
        v-if="justSolved"
        class="relative mt-4 -rotate-3 rounded-2xl border-[2.5px] border-ink bg-soft-yellow px-7 py-3 shadow-craft"
      >
        <span class="font-heading text-2xl text-ink">You found it!</span>
        <Doodle name="star" class="absolute -top-3.5 -right-3 text-ink" width="18" height="18" />
        <Doodle name="star" class="absolute -bottom-3 -left-2.5 text-ink" width="14" height="14" />
      </div>
    </div>
  </CraftScreen>
</template>
