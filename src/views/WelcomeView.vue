<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import PolaroidFrame from '@/components/polaroid/PolaroidFrame.vue'
import GridSizeToggle from '@/components/ui/GridSizeToggle.vue'
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
</script>

<template>
  <main class="flex min-h-screen items-center justify-center px-4 py-10">
    <div
      class="relative w-full max-w-xl overflow-hidden rounded-4xl bg-warm-white px-6 py-16 text-center shadow-[0_20px_45px_-20px_rgba(74,63,53,0.25)]"
    >
      <PolaroidFrame
        :rotation="-10"
        class="pointer-events-none absolute -top-8 -left-10 opacity-50"
      />
      <PolaroidFrame
        :rotation="8"
        class="pointer-events-none absolute -right-12 -bottom-10 opacity-50"
      />

      <div v-if="ready" class="relative flex flex-col items-center gap-8">
        <div class="relative pt-6">
          <WashiTape color="sky" :rotation="-6" class="absolute -top-5 -left-6" />
          <WashiTape color="soft-yellow" :rotation="5" class="absolute -top-4 -right-6" />
          <p class="text-sm tracking-[0.3em] text-ink/60 uppercase">
            A birthday scrapbook made just for you
          </p>
          <h1 class="text-5xl text-ink sm:text-6xl">Captured Wishes</h1>
        </div>

        <div v-if="!settingsStore.gridSize" class="w-full max-w-sm rounded-3xl bg-cream p-6 shadow-sm">
          <p class="mb-4 font-heading text-xl text-ink">Choose your puzzle size</p>
          <GridSizeToggle
            :model-value="settingsStore.gridSize"
            @update:model-value="settingsStore.setGridSize"
          />
        </div>
        <p v-else-if="hasProgress" class="text-sm text-ink/60">Let's pick up where you left off.</p>

        <button
          type="button"
          class="rounded-full bg-dusty-pink px-8 py-3 font-heading text-xl text-ink shadow-sm transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!settingsStore.gridSize"
          @click="begin"
        >
          {{ hasProgress ? 'Continue' : 'Open the scrapbook' }}
        </button>
      </div>
    </div>
  </main>
</template>
