<script setup lang="ts">
import { computed } from 'vue'

import SoundToggle from '@/components/ui/SoundToggle.vue'

type Tint = 'cream' | 'yellow' | 'sky' | 'pink' | 'lavender' | 'sage'

const props = withDefaults(
  defineProps<{
    tint?: Tint
    /** Show the washi-tape strips along the four page edges. */
    edges?: boolean
    /** Hide the persistent sound toggle (it is on by default). */
    hideSound?: boolean
  }>(),
  { tint: 'cream', edges: true, hideSound: false },
)

const bgClass = computed(
  () =>
    ({
      cream: 'bg-paper-cream',
      yellow: 'bg-paper-yellow',
      sky: 'bg-paper-sky',
      pink: 'bg-paper-pink',
      lavender: 'bg-paper-lavender',
      sage: 'bg-paper-sage',
    })[props.tint],
)
</script>

<template>
  <!--
    Mobile: the page fills the viewport edge to edge.
    sm+ : it becomes a bounded scrapbook "page" resting on a desk surface,
    with the paper texture, washi edges and sound toggle all attached to
    the page rather than the window.
  -->
  <main class="desk-surface flex min-h-dvh w-full justify-center font-body text-ink sm:py-10">
    <div
      class="relative w-full max-w-md overflow-hidden sm:rounded-[28px] sm:shadow-[0_40px_90px_-40px_rgba(74,63,53,0.55)] sm:ring-1 sm:ring-ink/10 lg:max-w-[30rem]"
      :class="bgClass"
    >
      <div class="paper-dots pointer-events-none absolute inset-0"></div>
      <div class="paper-ruled pointer-events-none absolute inset-0"></div>

      <template v-if="edges">
        <span
          class="pointer-events-none absolute -left-4 -right-4 top-3.5 z-[6] h-6 -rotate-[1.5deg] border border-white/40 bg-dusty-pink/80"
        ></span>
        <span
          class="pointer-events-none absolute -left-4 -right-4 bottom-4 z-[6] h-6 rotate-[1.3deg] border border-white/40 bg-sky/80"
        ></span>
        <span
          class="pointer-events-none absolute -top-5 -bottom-5 left-3 z-[6] w-6 rotate-[1.4deg] border border-white/40 bg-lavender/80"
        ></span>
        <span
          class="pointer-events-none absolute -top-5 -bottom-5 right-3 z-[6] w-6 -rotate-[1.2deg] border border-white/40 bg-sage/80"
        ></span>
      </template>

      <SoundToggle v-if="!hideSound" />

      <div class="relative z-10 flex min-h-dvh flex-col px-7 sm:min-h-[calc(100dvh-5rem)]">
        <slot />
      </div>
    </div>
  </main>
</template>
