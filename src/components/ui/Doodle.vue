<script lang="ts">
export default { inheritAttrs: false }
</script>

<script setup lang="ts">
defineProps<{
  name:
    | 'star'
    | 'squiggle'
    | 'arrow-down'
    | 'spin'
    | 'heart'
    | 'burst'
    | 'scribble'
    | 'tap'
    | 'pin'
}>()
</script>

<template>
  <!-- star / 4-point sparkle -->
  <svg
    v-if="name === 'star'"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linejoin="round"
    aria-hidden="true"
    v-bind="$attrs"
  >
    <path d="M12 3c.6 4.5 1.5 5.4 6 6-4.5.6-5.4 1.5-6 6-.6-4.5-1.5-5.4-6-6 4.5-.6 5.4-1.5 6-6z" />
  </svg>

  <!-- hand-drawn underline squiggle -->
  <svg
    v-else-if="name === 'squiggle'"
    width="196"
    height="12"
    viewBox="0 0 196 12"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
    aria-hidden="true"
    v-bind="$attrs"
  >
    <path d="M3 7c17-8 33 6 50 0s33-8 49 0 33 6 49 0 22-6 42-3" />
  </svg>

  <!-- dashed arrow, curling down -->
  <svg
    v-else-if="name === 'arrow-down'"
    width="40"
    height="46"
    viewBox="0 0 40 46"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    aria-hidden="true"
    v-bind="$attrs"
  >
    <path d="M15 3c9 8 11 17 5 27" stroke-dasharray="1 5" />
    <path d="M12 25l8 7 9-9" />
  </svg>

  <!-- circular "spin" gesture arrow -->
  <svg
    v-else-if="name === 'spin'"
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    aria-hidden="true"
    v-bind="$attrs"
  >
    <path d="M20 12a8 8 0 1 1-2.3-5.6" stroke-dasharray="2 4" />
    <path d="M20 3.5v4h-4" />
  </svg>

  <!-- heart -->
  <svg
    v-else-if="name === 'heart'"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="#4a3f35"
    stroke-width="1.1"
    aria-hidden="true"
    v-bind="$attrs"
  >
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
  </svg>

  <!-- starburst (sits behind buttons) -->
  <svg
    v-else-if="name === 'burst'"
    width="150"
    height="150"
    viewBox="0 0 120 120"
    fill="currentColor"
    stroke="#4a3f35"
    stroke-width="1.4"
    aria-hidden="true"
    v-bind="$attrs"
  >
    <path
      d="M60 4l8 20 20-12-6 22 22 4-18 14 14 18-22-4-2 22-16-16-16 16-2-22-22 4 14-18-18-14 22-4-6-22 20 12z"
    />
  </svg>

  <!-- rough scribble circle (around a selected option) -->
  <svg
    v-else-if="name === 'scribble'"
    width="122"
    height="100"
    viewBox="0 0 122 100"
    fill="none"
    stroke="currentColor"
    stroke-width="2.6"
    stroke-linecap="round"
    aria-hidden="true"
    v-bind="$attrs"
  >
    <path d="M61 6C89 4 115 22 114 49c-1 29-32 46-58 45C29 92 6 73 8 46 10 20 36 8 62 7" />
  </svg>

  <!-- tap target -->
  <svg
    v-else-if="name === 'tap'"
    width="36"
    height="36"
    viewBox="0 0 40 40"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    aria-hidden="true"
    v-bind="$attrs"
  >
    <circle cx="20" cy="22" r="10" stroke-dasharray="2 4" />
    <path d="M20 3v6M9 8l3.5 3.5M31 8l-3.5 3.5" />
  </svg>

  <!-- push pin -->
  <svg
    v-else
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="#4a3f35"
    stroke-width="1.4"
    stroke-linejoin="round"
    aria-hidden="true"
    v-bind="$attrs"
  >
    <path d="M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6z" />
    <path d="M12 16v6" fill="none" />
  </svg>
</template>
