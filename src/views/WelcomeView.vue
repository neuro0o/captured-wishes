<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import PolaroidFrame from '@/components/polaroid/PolaroidFrame.vue'
import CraftScreen from '@/components/ui/CraftScreen.vue'
import Doodle from '@/components/ui/Doodle.vue'
import GridSizeToggle from '@/components/ui/GridSizeToggle.vue'
import MarkerText from '@/components/ui/MarkerText.vue'
import PhotoCorners from '@/components/ui/PhotoCorners.vue'
import StickerButton from '@/components/ui/StickerButton.vue'
import WashiTape from '@/components/ui/WashiTape.vue'
import { useMemoriesStore } from '@/stores/memories'
import { useSettingsStore } from '@/stores/settings'
import { getResumeRoute } from '@/utils/progress'

const router = useRouter()
const settingsStore = useSettingsStore()
const memoriesStore = useMemoriesStore()

const ready = ref(false)
const hasProgress = computed(() =>
  Object.values(memoriesStore.records).some((record) => Boolean(record?.photoBlob)),
)

onMounted(async () => {
  await Promise.all([settingsStore.load(), memoriesStore.load()])
  ready.value = true
})

function begin() {
  if (!settingsStore.gridSize) return
  router.push(getResumeRoute(memoriesStore.records))
}

async function startFresh() {
  const confirmed = window.confirm(
    'This erases every captured photo and all progress on this device. Start over?',
  )
  if (!confirmed) return
  await memoriesStore.reset()
  await settingsStore.resetGridSize()
}
</script>

<template>
  <CraftScreen tint="yellow">
    <!-- torn banner -->
    <div class="torn-bottom relative -mx-7 min-h-[132px] bg-soft-yellow">
      <WashiTape color="dusty-pink" pattern="gingham" :rotation="-16" :length="128" class="absolute -left-4 top-4" />
      <WashiTape color="lavender" pattern="solid" :rotation="18" :length="120" class="absolute -right-5 top-2" />
    </div>

    <div v-if="ready" class="-mt-14 flex flex-1 flex-col items-center gap-5 pt-4 pb-12 sm:justify-center">
      <div class="relative -rotate-2">
        <h1 class="text-[42px] leading-none">
          <MarkerText as="span" color="soft-yellow">Captured</MarkerText> Wishes
        </h1>
        <Doodle name="squiggle" class="absolute -bottom-3 left-1/2 -translate-x-1/2 text-dusty-pink" width="200" height="12" />
        <Doodle name="star" class="absolute -top-3 -right-5 rotate-12 text-ink" width="19" height="19" />
        <Doodle name="star" class="absolute top-3 -left-5 text-ink" width="13" height="13" />
      </div>

      <p class="rotate-2 border border-dashed border-ink/30 bg-warm-white px-3 py-1 text-[9px] tracking-[0.14em] text-ink/70 uppercase shadow-craft-soft">
        A birthday scrapbook made just for you
      </p>

      <PolaroidFrame width-class="w-40" :rotation="-4" caption="open me!!" class="my-2">
        <WashiTape color="sky" :rotation="-8" :length="86" class="absolute -top-3 left-1/2 -translate-x-1/2" />
        <PhotoCorners :corners="['tl', 'br']" :size="16" />
      </PolaroidFrame>

      <template v-if="!settingsStore.gridSize">
        <p class="-rotate-1 font-heading text-xl text-ink">pick your puzzle size</p>
        <GridSizeToggle
          :model-value="settingsStore.gridSize"
          @update:model-value="settingsStore.setGridSize"
        />
      </template>
      <p v-else-if="hasProgress" class="font-hand text-lg text-ink/60">
        let's pick up where you left off
      </p>

      <Doodle name="arrow-down" class="text-ink/50" width="38" height="42" />

      <div class="relative">
        <Doodle
          v-if="settingsStore.gridSize"
          name="burst"
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-soft-yellow/60"
          width="170"
          height="170"
        />
        <StickerButton
          variant="primary"
          tone="lavender"
          size="lg"
          class="relative -rotate-2"
          :disabled="!settingsStore.gridSize"
          @click="begin"
        >
          {{ hasProgress ? 'Continue' : 'Open the scrapbook!' }}
        </StickerButton>
      </div>

      <div v-if="hasProgress" class="mt-1 flex items-center gap-3">
        <Doodle name="star" class="text-ink/70" width="15" height="15" />
        <button
          type="button"
          class="-rotate-2 border border-dashed border-ink/30 bg-cream px-2.5 py-1.5 text-[10px] text-ink/50 shadow-craft-soft transition hover:text-ink/70"
          @click="startFresh"
        >
          start fresh
        </button>
        <Doodle name="heart" class="text-dusty-pink" width="14" height="14" />
      </div>
    </div>
  </CraftScreen>
</template>
