<script setup lang="ts">
import { useObjectUrl } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import PolaroidFrame from '@/components/polaroid/PolaroidFrame.vue'
import WishNote from '@/components/scrapbook/WishNote.vue'
import { MEMORY_PROMPTS, WISH_NOTES } from '@/content/memories.config'
import { useMemoriesStore } from '@/stores/memories'
import type { MemoryId } from '@/types/memory'
import { getMemoryStep } from '@/utils/progress'

const props = defineProps<{ id: string }>()
const memoryId = computed(() => props.id as MemoryId)
const prompt = computed(() => MEMORY_PROMPTS.find((entry) => entry.id === memoryId.value))
const wish = computed(() => WISH_NOTES.find((entry) => entry.id === memoryId.value))

const router = useRouter()
const memoriesStore = useMemoriesStore()

const photoBlob = computed(() => memoriesStore.records[memoryId.value]?.photoBlob ?? null)
const photoUrl = useObjectUrl(photoBlob)

const revealed = ref(false)

onMounted(async () => {
  await memoriesStore.load()
  const record = memoriesStore.records[memoryId.value]
  const step = getMemoryStep(record)
  if (step === 'capture' || step === 'puzzle') {
    router.replace({ name: step, params: { id: memoryId.value } })
    return
  }
  revealed.value = record?.wishUnlocked ?? false
})

async function reveal() {
  if (revealed.value) return
  revealed.value = true
  await memoriesStore.markWishUnlocked(memoryId.value)
}

const nextMemoryId = computed<MemoryId | null>(() => {
  const currentPos = MEMORY_PROMPTS.findIndex((entry) => entry.id === memoryId.value)
  return MEMORY_PROMPTS[currentPos + 1]?.id ?? null
})

function goNext() {
  if (nextMemoryId.value) {
    router.push({ name: 'capture', params: { id: nextMemoryId.value } })
  } else {
    router.push({ name: 'scrapbook' })
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center px-4 py-10">
    <div
      class="relative w-full max-w-xl overflow-hidden rounded-4xl bg-warm-white px-6 py-10 text-center shadow-[0_20px_45px_-20px_rgba(74,63,53,0.25)]"
    >
      <template v-if="prompt">
        <p class="mb-1 text-4xl">{{ prompt.emoji }}</p>
        <h1 class="mb-6 text-3xl text-ink">Memory restored</h1>
      </template>

      <div class="flex flex-col items-center gap-6">
        <button
          type="button"
          class="cursor-pointer touch-manipulation border-0 bg-transparent p-0 transition"
          :class="revealed ? '' : 'active:scale-95'"
          @click="reveal"
        >
          <PolaroidFrame :image-url="photoUrl" />
        </button>

        <p v-if="!revealed" class="text-sm text-ink/60">
          Tap the photo to find what's tucked behind it
        </p>

        <WishNote v-if="wish" :lines="wish.lines" :open="revealed" />

        <button
          v-if="revealed"
          type="button"
          class="rounded-full bg-dusty-pink px-8 py-3 font-heading text-xl text-ink shadow-sm transition hover:brightness-95"
          @click="goNext"
        >
          {{ nextMemoryId ? 'Next memory' : 'See the scrapbook' }}
        </button>
      </div>
    </div>
  </main>
</template>
