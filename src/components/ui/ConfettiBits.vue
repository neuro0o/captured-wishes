<script setup lang="ts">
// Static decorative confetti scatter. The celebratory burst animation is
// handled separately by canvas-confetti; this is just paper on the page.
interface Bit {
  top?: string
  bottom?: string
  left?: string
  right?: string
  w: number
  h: number
  round: boolean
  c: string
  r: string
}

const bits: Bit[] = [
  { top: '8%', left: '12%', w: 10, h: 10, round: true, c: 'bg-dusty-pink', r: '18deg' },
  { top: '14%', right: '13%', w: 8, h: 14, round: false, c: 'bg-sky', r: '32deg' },
  { top: '30%', left: '7%', w: 9, h: 9, round: true, c: 'bg-soft-yellow', r: '0deg' },
  { top: '42%', right: '9%', w: 8, h: 13, round: false, c: 'bg-sage', r: '-24deg' },
  { top: '58%', left: '13%', w: 10, h: 10, round: true, c: 'bg-lavender', r: '0deg' },
  { bottom: '20%', right: '14%', w: 8, h: 8, round: true, c: 'bg-dusty-pink', r: '0deg' },
  { bottom: '14%', left: '18%', w: 9, h: 13, round: false, c: 'bg-sky', r: '15deg' },
  { bottom: '30%', right: '20%', w: 7, h: 7, round: true, c: 'bg-soft-yellow', r: '0deg' },
]
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <span
      v-for="(b, i) in bits"
      :key="i"
      class="absolute"
      :class="[b.c, b.round ? 'rounded-full' : 'rounded-[1px]']"
      :style="{
        top: b.top,
        bottom: b.bottom,
        left: b.left,
        right: b.right,
        width: `${b.w}px`,
        height: `${b.h}px`,
        transform: `rotate(${b.r})`,
      }"
    ></span>
  </div>
</template>
