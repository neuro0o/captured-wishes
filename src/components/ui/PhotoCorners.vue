<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Which corners to draw. */
    corners?: ('tl' | 'tr' | 'bl' | 'br')[]
    /** Triangle leg length in px. */
    size?: number
    /** Inset from the edge in px. */
    inset?: number
  }>(),
  { corners: () => ['tl', 'br'], size: 16, inset: 5 },
)

// Each corner is a right triangle formed with CSS borders, ink-coloured.
function style(corner: 'tl' | 'tr' | 'bl' | 'br', size: number, inset: number) {
  const base = { position: 'absolute' as const, width: '0', height: '0' }
  const s = `${size}px`
  const i = `${inset}px`
  if (corner === 'tl')
    return { ...base, top: i, left: i, borderTop: `${s} solid #4a3f35`, borderRight: `${s} solid transparent` }
  if (corner === 'tr')
    return { ...base, top: i, right: i, borderTop: `${s} solid #4a3f35`, borderLeft: `${s} solid transparent` }
  if (corner === 'bl')
    return { ...base, bottom: i, left: i, borderBottom: `${s} solid #4a3f35`, borderRight: `${s} solid transparent` }
  return { ...base, bottom: i, right: i, borderBottom: `${s} solid #4a3f35`, borderLeft: `${s} solid transparent` }
}
</script>

<template>
  <span
    v-for="corner in corners"
    :key="corner"
    class="pointer-events-none"
    :style="style(corner, size, inset)"
    aria-hidden="true"
  />
</template>
