<script setup lang="ts">
import { useObjectUrl } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import PolaroidFrame from '@/components/polaroid/PolaroidFrame.vue'
import { useCamera } from '@/composables/useCamera'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { MEMORY_PROMPTS } from '@/content/memories.config'
import { useMemoriesStore } from '@/stores/memories'
import type { MemoryId } from '@/types/memory'
import { processPhotoBlob } from '@/utils/image'

const props = defineProps<{ id: string }>()
const memoryId = computed(() => props.id as MemoryId)
const prompt = computed(() => MEMORY_PROMPTS.find((entry) => entry.id === memoryId.value))

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

onMounted(() => {
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
      router.push({ name: 'puzzle', params: { id: memoryId.value } })
    },
    reducedMotion.value ? 300 : 2200,
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
        <h1 class="mb-6 text-3xl text-ink">{{ prompt.prompt }}</h1>
      </template>

      <div v-if="phase === 'camera'" class="flex flex-col items-center gap-5">
        <div
          v-if="!error"
          class="relative aspect-3/4 w-full max-w-xs overflow-hidden rounded-3xl bg-ink/10"
        >
          <video
            :ref="(el) => (videoRef = el as HTMLVideoElement | null)"
            autoplay
            playsinline
            muted
            class="h-full w-full object-cover"
            :class="{ '-scale-x-100': facingMode === 'user' }"
          />
        </div>
        <p v-else class="max-w-xs text-sm text-ink/70">
          We couldn't reach your camera. You can still choose a photo below.
        </p>

        <div v-if="!error" class="flex items-center gap-4">
          <button
            type="button"
            aria-label="Take photo"
            class="h-16 w-16 rounded-full border-4 border-ink/20 bg-dusty-pink shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!isReady"
            @click="handleShutter"
          />
          <button
            type="button"
            aria-label="Switch camera"
            class="rounded-full bg-cream px-3 py-2 text-sm text-ink/70 transition hover:brightness-95"
            @click="flip"
          >
            Flip
          </button>
        </div>

        <label class="cursor-pointer text-sm text-ink/60 underline underline-offset-4">
          Choose from gallery instead
          <input type="file" accept="image/*" class="hidden" @change="handleFilePick" />
        </label>
      </div>

      <div v-else-if="phase === 'review'" class="flex flex-col items-center gap-5">
        <div class="aspect-3/4 w-full max-w-xs overflow-hidden rounded-3xl bg-ink/10">
          <img v-if="rawUrl" :src="rawUrl" alt="" class="h-full w-full object-cover" />
        </div>
        <div class="flex gap-4">
          <button
            type="button"
            class="rounded-full border-2 border-ink/20 px-6 py-2 font-heading text-lg text-ink transition hover:bg-ink/5"
            @click="retake"
          >
            Retake
          </button>
          <button
            type="button"
            class="rounded-full bg-dusty-pink px-6 py-2 font-heading text-lg text-ink shadow-sm transition hover:brightness-95"
            @click="confirmPhoto"
          >
            Use this photo
          </button>
        </div>
      </div>

      <div v-else class="flex flex-col items-center gap-4">
        <PolaroidFrame :image-url="developedUrl" :developing="!isDeveloped" />
        <p class="text-sm text-ink/60">Developing your memory…</p>
      </div>
    </div>
  </main>
</template>
