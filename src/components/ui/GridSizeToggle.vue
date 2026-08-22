<script setup lang="ts">
import type { GridSize } from '@/types/memory'

defineProps<{ modelValue: GridSize | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: GridSize): void }>()

const options: { size: GridSize; label: string; hint: string }[] = [
  { size: 3, label: '3 × 3', hint: 'Quicker to piece together' },
  { size: 5, label: '5 × 5', hint: 'More of a challenge' },
]
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row">
    <button
      v-for="option in options"
      :key="option.size"
      type="button"
      class="flex-1 rounded-2xl border-2 px-5 py-4 text-center transition"
      :class="
        modelValue === option.size
          ? 'border-dusty-pink bg-dusty-pink/20'
          : 'border-ink/15 bg-warm-white hover:border-ink/30'
      "
      @click="emit('update:modelValue', option.size)"
    >
      <span class="block font-heading text-2xl text-ink">{{ option.label }}</span>
      <span class="mt-1 block text-xs text-ink/60">{{ option.hint }}</span>
    </button>
  </div>
</template>
