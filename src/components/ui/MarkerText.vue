<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Heading element to render. */
    as?: 'h1' | 'h2' | 'h3' | 'span' | 'p'
    /** Swipe colour (any theme colour token name). */
    color?: 'soft-yellow' | 'dusty-pink' | 'sky' | 'sage' | 'lavender' | 'warm-white'
  }>(),
  { as: 'span', color: 'soft-yellow' },
)

const swipeBg: Record<string, string> = {
  'soft-yellow': 'bg-soft-yellow',
  'dusty-pink': 'bg-dusty-pink',
  sky: 'bg-sky',
  sage: 'bg-sage',
  lavender: 'bg-lavender',
  'warm-white': 'bg-warm-white',
}
</script>

<template>
  <component :is="as" class="relative inline-block font-heading text-ink">
    <span class="marker-swipe" :class="swipeBg[color]" aria-hidden="true"></span>
    <span class="relative z-[1]"><slot /></span>
  </component>
</template>
