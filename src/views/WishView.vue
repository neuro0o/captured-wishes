<script setup lang="ts">
import { useObjectUrl } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import PolaroidFrame from '@/components/polaroid/PolaroidFrame.vue'
import WishNote from '@/components/scrapbook/WishNote.vue'
import CraftScreen from '@/components/ui/CraftScreen.vue'
import Doodle from '@/components/ui/Doodle.vue'
import MarkerText from '@/components/ui/MarkerText.vue'
import PhotoCorners from '@/components/ui/PhotoCorners.vue'
import StickerButton from '@/components/ui/StickerButton.vue'
import WashiTape from '@/components/ui/WashiTape.vue'
import { playSfx } from '@/composables/useAudio'
import { MEMORY_PROMPTS, WISH_NOTES } from '@/content/memories.config'
import { useMemoriesStore } from '@/stores/memories'
import type { MemoryId } from '@/types/memory'
import { getMemoryStep, getResumeRoute } from '@/utils/progress'

const props = defineProps<{ id: string }>()
const memoryId = computed(() => props.id as MemoryId)
const prompt = computed(() => MEMORY_PROMPTS.find((entry) => entry.id === memoryId.value))
const wish = computed(() => WISH_NOTES.find((entry) => entry.id === memoryId.value))
const noteIndex = computed(() => Number(memoryId.value))

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
    router.replace(getResumeRoute(memoriesStore.records))
    return
  }
  revealed.value = record?.wishUnlocked ?? false
})

async function reveal() {
  if (revealed.value) return
  revealed.value = true
  playSfx('note-unfold')
  await memoriesStore.markWishUnlocked(memoryId.value)
}

const nextTarget = computed(() => getResumeRoute(memoriesStore.records))

function goNext() {
  router.push(nextTarget.value)
}
</script>

<template>
  <CraftScreen tint="pink">
    <div class="flex flex-1 flex-col items-center gap-5 pt-16 pb-10">
      <MarkerText v-if="prompt" as="h1" color="soft-yellow" class="-rotate-2 text-3xl">
        Memory restored
      </MarkerText>

      <div class="relative mt-6">
        <template v-if="!revealed">
          <div class="absolute -bottom-4 left-1/2 h-14 w-52 -translate-x-1/2 rotate-3 rounded-[3px] border border-ink/20 bg-[#fffdf5] shadow-[0_10px_18px_-10px_rgba(74,63,53,0.4)]"></div>
          <div class="absolute -bottom-2 left-1/2 h-12 w-56 -translate-x-1/2 -rotate-2 rounded-[3px] border border-ink/15 bg-[#fffdf5]"></div>
        </template>

        <button
          type="button"
          :disabled="revealed"
          class="relative z-10 border-0 bg-transparent p-0 transition"
          :class="revealed ? '' : 'cursor-pointer touch-manipulation active:scale-95'"
          @click="reveal"
        >
          <PolaroidFrame
            :image-url="photoUrl"
            :width-class="revealed ? 'w-32' : 'w-64'"
            :rotation="-4"
            :caption="revealed ? '' : 'something’s behind here…'"
          >
            <WashiTape color="dusty-pink" :rotation="-6" :length="revealed ? 66 : 120" class="absolute -top-3 left-1/2 -translate-x-1/2" />
            <PhotoCorners v-if="!revealed" :corners="['tl']" :size="16" />
          </PolaroidFrame>
        </button>

        <Doodle name="star" class="absolute -top-4 right-6 rotate-12 text-ink" width="18" height="18" />
      </div>

      <template v-if="!revealed">
        <div class="mt-4 flex items-center gap-3">
          <Doodle name="tap" class="text-ink" width="34" height="34" />
          <p class="rotate-[1.5deg] border border-dashed border-ink/30 bg-warm-white px-3.5 py-2 text-[10.5px] text-ink/70 shadow-craft-soft">
            Tap the photo to find what's tucked behind it
          </p>
        </div>
        <Doodle name="arrow-down" class="rotate-180 text-ink/50" width="30" height="42" />
      </template>

      <WishNote
        v-if="wish"
        :lines="wish.lines"
        :title="wish.title"
        :note-index="noteIndex"
        :open="revealed"
      />

      <div v-if="revealed" class="mt-2">
        <StickerButton variant="primary" tone="dusty-pink" size="md" class="-rotate-2" @click="goNext">
          {{ nextTarget.name === 'scrapbook' ? 'See the scrapbook' : 'Next puzzle →' }}
        </StickerButton>
      </div>
    </div>
  </CraftScreen>
</template>
