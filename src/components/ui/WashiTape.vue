<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: 'sage' | 'lavender' | 'sky' | 'soft-yellow' | 'dusty-pink'
    rotation?: number
  }>(),
  {
    color: 'soft-yellow',
    rotation: -4,
  },
)

const colorClass: Record<string, string> = {
  sage: 'bg-sage/70',
  lavender: 'bg-lavender/70',
  sky: 'bg-sky/70',
  'soft-yellow': 'bg-soft-yellow/70',
  'dusty-pink': 'bg-dusty-pink/70',
}
</script>

<template>
  <span
    class="pointer-events-none block h-6 w-20 rounded-[2px] shadow-sm"
    :class="colorClass[color]"
    :style="{ transform: `rotate(${rotation}deg)` }"
  />
</template>
