<script setup lang="ts">
import { computed } from 'vue'

type Color = 'sage' | 'lavender' | 'sky' | 'soft-yellow' | 'dusty-pink'

const props = withDefaults(
  defineProps<{
    color?: Color
    pattern?: 'solid' | 'stripe' | 'gingham'
    rotation?: number
    /** Tape length in px. */
    length?: number
  }>(),
  { color: 'soft-yellow', pattern: 'stripe', rotation: -4, length: 84 },
)

const rgb: Record<Color, string> = {
  sage: '169,191,160',
  lavender: '198,184,217',
  sky: '170,203,221',
  'soft-yellow': '237,216,160',
  'dusty-pink': '232,185,190',
}

const background = computed(() => {
  const c = rgb[props.color]
  if (props.pattern === 'solid') return `rgba(${c},0.82)`
  if (props.pattern === 'gingham')
    return `repeating-linear-gradient(90deg, rgba(${c},0.9) 0 7px, rgba(${c},0.4) 7px 14px)`
  return `repeating-linear-gradient(45deg, rgba(${c},0.92) 0 7px, rgba(${c},0.42) 7px 14px)`
})
</script>

<template>
  <span
    class="pointer-events-none block h-6 rounded-[2px] border border-white/45"
    :style="{ width: `${length}px`, background, transform: `rotate(${rotation}deg)` }"
    aria-hidden="true"
  />
</template>
