<script setup lang="ts">
import type { MemoryId } from '@/types/memory'

withDefaults(defineProps<{ id: MemoryId; size?: number }>(), { size: 44 })
</script>

<template>
  <span
    class="grid shrink-0 -rotate-6 place-items-center rounded-full border-2 border-ink bg-dusty-pink text-warm-white shadow-craft-soft"
    :style="{ width: `${size}px`, height: `${size}px` }"
    aria-hidden="true"
  >
    <!-- 1 · The Little Things → a smile -->
    <svg
      v-if="id === '1'"
      :width="size * 0.5"
      :height="size * 0.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14a5 5 0 0 0 8 0" />
      <path d="M9 9.5h.01M15 9.5h.01" />
    </svg>

    <!-- 2 · What I Hope You Know → a letter -->
    <svg
      v-else-if="id === '2'"
      :width="size * 0.5"
      :height="size * 0.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linejoin="round"
      stroke-linecap="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5 12 13l8.5-6.5" />
    </svg>

    <!-- 3 · For Everything Ahead → a sprout -->
    <svg
      v-else
      :width="size * 0.5"
      :height="size * 0.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M12 21v-8" />
      <path d="M12 13c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6z" />
      <path d="M12 12c0-3.9 3.1-7 7-7 0 3.9-3.1 7-7 7z" />
    </svg>
  </span>
</template>
