<script setup lang="ts">
import Doodle from '@/components/ui/Doodle.vue'
import PhotoCorners from '@/components/ui/PhotoCorners.vue'
import WashiTape from '@/components/ui/WashiTape.vue'

withDefaults(
  defineProps<{
    lines: string[]
    title?: string
    noteIndex?: number
    open?: boolean
  }>(),
  { open: false, title: '', noteIndex: 1 },
)
</script>

<template>
  <div
    class="relative w-full max-w-sm origin-top rotate-1 rounded bg-[#fffdf5] text-left transition-[max-height,padding,opacity] duration-700 ease-out"
    :class="
      open
        ? 'max-h-[540px] overflow-y-auto overscroll-contain border border-ink/20 px-7 py-7 opacity-100 shadow-[0_20px_34px_-16px_rgba(74,63,53,0.45)] sm:max-h-none sm:overflow-visible'
        : 'max-h-0 overflow-hidden border border-transparent px-7 py-0 opacity-0'
    "
  >
    <template v-if="open">
      <WashiTape color="soft-yellow" :rotation="4" :length="92" class="absolute -top-3 right-9" />
      <PhotoCorners :corners="['bl']" :size="15" :inset="5" />
      <!-- fold creases -->
      <span class="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-ink/10" aria-hidden="true"></span>
      <span class="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-ink/10" aria-hidden="true"></span>
    </template>

    <div
      class="relative transition-opacity duration-500"
      :class="open ? 'opacity-100 delay-300' : 'opacity-0'"
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
        <span class="font-hand text-lg text-ink/70">&mdash; N</span>
        <Doodle name="heart" width="16" height="16" class="text-dusty-pink" />
      </div>
    </div>
  </div>
</template>
