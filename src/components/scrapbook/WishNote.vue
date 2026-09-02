<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

import Doodle from '@/components/ui/Doodle.vue'
import WashiTape from '@/components/ui/WashiTape.vue'

const props = withDefaults(
  defineProps<{
    lines: string[]
    title?: string
    noteIndex?: number
    open?: boolean
  }>(),
  { open: false, title: '', noteIndex: 1 },
)

// On mobile the note body scrolls (it's capped); on sm+ it grows freely. Show a
// "keep reading" nudge while there's more below the fold. The scroll container is
// the inner body, so the washi tape / photo corner / fade all stay pinned to the
// card instead of scrolling away with the text (which is what made the corner
// look like a stray triangle mid-note).
const body = ref<HTMLElement | null>(null)
const moreBelow = ref(false)

function updateMoreBelow() {
  const el = body.value
  moreBelow.value = !!el && el.scrollHeight - el.scrollTop - el.clientHeight > 8
}

onMounted(updateMoreBelow)
watch(
  () => props.open,
  (open) => {
    if (!open) {
      moreBelow.value = false
      return
    }
    nextTick(updateMoreBelow)
    // Re-check after the unfold transition and any late font reflow.
    window.setTimeout(updateMoreBelow, 800)
  },
)
</script>

<template>
  <div
    class="relative w-full max-w-sm origin-top rotate-1 overflow-hidden rounded border bg-[#fffdf5] text-left shadow-[0_20px_34px_-16px_rgba(74,63,53,0.45)] transition-[max-height,opacity] duration-700 ease-out"
    :class="
      open
        ? 'max-h-[600px] border-ink/20 opacity-100 sm:max-h-none sm:overflow-visible'
        : 'max-h-0 border-transparent opacity-0 shadow-none'
    "
  >
    <template v-if="open">
      <WashiTape color="soft-yellow" :rotation="4" :length="92" class="absolute -top-3 right-9 z-20" />
      <!-- photo corner, pinned to the card (above the scroll fade so it stays crisp) -->
      <span
        class="pointer-events-none absolute bottom-[5px] left-[5px] z-30 h-0 w-0 border-r-[15px] border-b-[15px] border-r-transparent border-b-ink"
        aria-hidden="true"
      ></span>
      <!-- fold creases -->
      <span class="pointer-events-none absolute inset-x-0 top-1/3 z-10 h-px bg-ink/10" aria-hidden="true"></span>
      <span class="pointer-events-none absolute inset-x-0 top-2/3 z-10 h-px bg-ink/10" aria-hidden="true"></span>

      <!-- scroll cue: fade + nudge, pinned to the card, mobile only -->
      <div
        v-if="moreBelow"
        class="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex h-16 items-end justify-center bg-linear-to-t from-[#fffdf5] via-[#fffdf5]/80 to-transparent sm:hidden"
      >
        <span class="scroll-nudge mb-2 flex items-center gap-1 font-hand text-[13px] text-ink/45">
          keep reading
          <svg width="13" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M1 1l6 6 6-6" />
          </svg>
        </span>
      </div>
    </template>

    <div
      ref="body"
      class="max-h-[540px] overflow-y-auto overscroll-contain px-7 py-7 transition-opacity duration-500 sm:max-h-none sm:overflow-visible"
      :class="open ? 'opacity-100 delay-300' : 'opacity-0'"
      @scroll="updateMoreBelow"
    >
      <p class="font-hand text-sm tracking-[0.14em] text-ink/45 uppercase">
        a wish for you &mdash; no. {{ noteIndex }}
      </p>
      <h3 v-if="title" class="mt-1 font-heading text-2xl text-ink">{{ title }}</h3>

      <p
        v-for="(line, index) in lines"
        :key="index"
        class="font-hand text-xl leading-relaxed text-ink"
        :class="index === 0 ? 'mt-4' : 'mt-3'"
      >
        {{ line }}
      </p>

      <div class="mt-5 flex items-center justify-end gap-1.5">
        <span class="font-hand text-lg text-ink/70">&mdash; Neuro</span>
        <Doodle name="heart" width="16" height="16" class="text-dusty-pink" />
      </div>
    </div>
  </div>
</template>
