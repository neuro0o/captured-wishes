<script setup lang="ts">
import { useObjectUrl } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import PolaroidFrame from '@/components/polaroid/PolaroidFrame.vue'
import CraftScreen from '@/components/ui/CraftScreen.vue'
import Doodle from '@/components/ui/Doodle.vue'
import MarkerText from '@/components/ui/MarkerText.vue'
import PhotoCorners from '@/components/ui/PhotoCorners.vue'
import ProgressFilmstrip from '@/components/ui/ProgressFilmstrip.vue'
import PromptIcon from '@/components/ui/PromptIcon.vue'
import StickerButton from '@/components/ui/StickerButton.vue'
import WashiTape from '@/components/ui/WashiTape.vue'
import { useCamera } from '@/composables/useCamera'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { MEMORY_PROMPTS } from '@/content/memories.config'
import { useMemoriesStore } from '@/stores/memories'
import type { MemoryId } from '@/types/memory'
import { processPhotoBlob } from '@/utils/image'
import { getResumeRoute } from '@/utils/progress'

const props = defineProps<{ id: string }>()
const memoryId = computed(() => props.id as MemoryId)
const prompt = computed(() => MEMORY_PROMPTS.find((entry) => entry.id === memoryId.value))
const currentStep = computed(() => Number(memoryId.value))

const router = useRouter()
const memoriesStore = useMemoriesStore()
const reducedMotion = useReducedMotion()

const { videoRef, isReady, error, facingMode, start, stop, flip, capture } = useCamera()

type Phase = 'camera' | 'review' | 'developing'
const phase = ref<Phase>('camera')

const rawBlob = ref<Blob | null>(null)
const rawUrl = useObjectUrl(rawBlob)

const processedBlob = ref<Blob | null>(null)
const developedUrl = useObjectUrl(processedBlob)
const isDeveloped = ref(false)

const tint = computed(() =>
  phase.value === 'review' ? 'pink' : phase.value === 'developing' ? 'lavender' : 'sky',
)

onMounted(async () => {
  await memoriesStore.load()
  const target = getResumeRoute(memoriesStore.records)
  if (target.name !== 'capture' || target.params.id !== memoryId.value) {
    router.replace(target)
    return
  }
  start()
})

async function handleShutter() {
  const blob = await capture()
  if (!blob) return
  rawBlob.value = blob
  stop()
  phase.value = 'review'
}

function handleFilePick(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  stop()
  rawBlob.value = file
  phase.value = 'review'
}

function retake() {
  rawBlob.value = null
  phase.value = 'camera'
  start()
}

async function confirmPhoto() {
  if (!rawBlob.value) return
  const processed = await processPhotoBlob(rawBlob.value)
  processedBlob.value = processed
  await memoriesStore.capturePhoto(memoryId.value, processed)
  phase.value = 'developing'

  window.setTimeout(
    () => {
      isDeveloped.value = true
    },
    reducedMotion.value ? 0 : 50,
  )
  window.setTimeout(
    () => {
      router.push(getResumeRoute(memoriesStore.records))
    },
    reducedMotion.value ? 300 : 2200,
  )
}
</script>

<template>
  <CraftScreen :tint="tint">
    <div class="flex flex-1 flex-col items-center gap-4 pt-14 pb-10 sm:justify-center sm:pt-10">
      <!-- prompt -->
      <template v-if="prompt && phase !== 'developing'">
        <div class="flex -rotate-1 items-center gap-2.5">
          <PromptIcon :id="memoryId" :size="phase === 'review' ? 38 : 44" />
          <MarkerText as="h1" color="soft-yellow" :class="phase === 'review' ? 'text-2xl' : 'text-[25px]'">
            {{ prompt.prompt }}
          </MarkerText>
          <Doodle v-if="phase === 'camera'" name="star" class="text-ink" width="15" height="15" />
        </div>
      </template>

      <!-- CAMERA -->
      <template v-if="phase === 'camera'">
        <ProgressFilmstrip :current="currentStep" class="mt-1" />

        <div class="relative mt-3 rotate-[1.5deg]">
          <svg
            width="24"
            height="44"
            viewBox="0 0 24 44"
            fill="none"
            stroke="#4a3f35"
            stroke-width="2.4"
            stroke-linecap="round"
            class="absolute -top-4 right-11 z-10"
            aria-hidden="true"
          >
            <path d="M8 9v25a5 5 0 0 0 10 0V11a3 3 0 0 0-6 0v23" />
          </svg>

          <div
            v-if="!error"
            class="relative aspect-[3/4] w-[300px] overflow-hidden rounded-xl border-[3px] border-ink bg-ink/10 shadow-craft-lg"
          >
            <video
              :ref="(el) => (videoRef = el as HTMLVideoElement | null)"
              autoplay
              playsinline
              muted
              class="h-full w-full object-cover"
              :class="{ '-scale-x-100': facingMode === 'user' }"
            />
            <span class="absolute top-3.5 left-3.5 h-5 w-5 border-t-[3px] border-l-[3px] border-warm-white"></span>
            <span class="absolute top-3.5 right-3.5 h-5 w-5 border-t-[3px] border-r-[3px] border-warm-white"></span>
            <span class="absolute bottom-3.5 left-3.5 h-5 w-5 border-b-[3px] border-l-[3px] border-warm-white"></span>
            <span class="absolute right-3.5 bottom-3.5 h-5 w-5 border-r-[3px] border-b-[3px] border-warm-white"></span>
            <WashiTape color="soft-yellow" :rotation="-8" :length="100" class="absolute -top-3 left-6" />
            <WashiTape color="sage" pattern="solid" :rotation="-6" :length="100" class="absolute -bottom-3 right-5" />
          </div>
          <p v-else class="max-w-xs rotate-[-1.5deg] font-hand text-lg text-ink/70">
            We couldn't reach your camera &mdash; you can still choose a photo below.
          </p>
        </div>

        <div v-if="!error" class="mt-5 flex items-center gap-6">
          <StickerButton variant="secondary" tone="warm-white" size="sm" class="-rotate-3" @click="flip">
            Flip
          </StickerButton>
          <button
            type="button"
            aria-label="Take photo"
            class="grid h-20 w-20 place-items-center rounded-full border-[6px] border-ink bg-dusty-pink shadow-craft transition active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!isReady"
            @click="handleShutter"
          >
            <span class="h-[54px] w-[54px] rounded-full border-[3px] border-ink"></span>
          </button>
          <Doodle name="arrow-down" class="scale-x-[-1] text-ink/50" width="34" height="40" />
        </div>

        <label
          class="mt-5 -rotate-1 cursor-pointer border border-dashed border-ink/30 bg-cream px-3.5 py-2 text-[11px] text-ink/60 shadow-craft-soft"
        >
          choose from gallery instead
          <input type="file" accept="image/*" class="hidden" @change="handleFilePick" />
        </label>
      </template>

      <!-- REVIEW -->
      <template v-else-if="phase === 'review'">
        <MarkerText as="p" color="soft-yellow" class="mt-5 text-[26px]">how's this one?</MarkerText>

        <div class="relative mt-4 -rotate-3 rounded-lg border-[3px] border-ink shadow-craft-lg">
          <div class="aspect-[3/4] w-[288px] overflow-hidden rounded-[5px] bg-ink/10">
            <img v-if="rawUrl" :src="rawUrl" alt="" class="h-full w-full object-cover" />
          </div>
          <WashiTape color="lavender" :rotation="-7" :length="118" class="absolute -top-3 left-9" />
          <WashiTape color="soft-yellow" pattern="solid" :rotation="-4" :length="104" class="absolute -bottom-3 right-8" />
          <PhotoCorners :corners="['tl', 'br']" :size="18" :inset="6" />
        </div>

        <div class="mt-8 flex gap-5">
          <StickerButton variant="ghost" size="md" class="-rotate-3" @click="retake">Retake</StickerButton>
          <StickerButton variant="primary" tone="sage" size="md" class="rotate-2" @click="confirmPhoto">
            Use this one!
          </StickerButton>
        </div>

        <div class="mt-6 flex items-center gap-2 opacity-60">
          <Doodle name="star" class="text-ink" width="14" height="14" />
          <span class="font-hand text-[15px] text-ink/60">it becomes a Polaroid next</span>
        </div>
      </template>

      <!-- DEVELOPING -->
      <template v-else>
        <MarkerText as="h1" color="soft-yellow" class="mt-6 -rotate-2 text-3xl">developing&hellip;</MarkerText>

        <PolaroidFrame
          :image-url="developedUrl"
          :developing="!isDeveloped"
          width-class="w-56"
          :rotation="-4"
          class="mt-12"
        >
          <Doodle name="pin" class="absolute -top-3.5 left-1/2 -translate-x-1/2 text-dusty-pink" width="26" height="26" />
          <WashiTape color="sage" :rotation="24" :length="76" class="absolute -top-1.5 -right-3" />
          <Doodle name="star" class="absolute top-9 -right-2.5 text-ink" width="14" height="14" />
          <Doodle name="star" class="absolute bottom-16 -left-3 text-ink" width="11" height="11" />
        </PolaroidFrame>

        <p class="mt-10 font-hand text-lg text-ink/65 italic">coming into focus&hellip;</p>
        <Doodle name="spin" class="mt-4 text-ink/45" width="46" height="46" />
      </template>
    </div>
  </CraftScreen>
</template>
