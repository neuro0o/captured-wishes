<script setup lang="ts">
import Doodle from '@/components/ui/Doodle.vue'
import type { GridSize } from '@/types/memory'

defineProps<{ modelValue: GridSize | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: GridSize): void }>()

const options: { size: GridSize; label: string; hint: string; rotate: string }[] = [
  { size: 3, label: '3 × 3', hint: 'quicker', rotate: '-rotate-3' },
  { size: 5, label: '5 × 5', hint: 'trickier', rotate: 'rotate-2' },
]
</script>

<template>
  <div class="flex items-center justify-center gap-5">
    <button
      v-for="option in options"
      :key="option.size"
      type="button"
      class="relative grid h-20 w-24 place-items-center gap-1 rounded-2xl border-[2.5px] font-heading transition active:translate-x-1 active:translate-y-1 active:shadow-none"
      :class="[
        option.rotate,
        modelValue === option.size
          ? 'border-ink bg-warm-white text-ink shadow-craft-sm'
          : 'border-ink/35 bg-cream text-ink/55 opacity-80 shadow-[4px_4px_0_rgba(74,63,53,0.22)]',
      ]"
      :aria-pressed="modelValue === option.size"
      @click="emit('update:modelValue', option.size)"
    >
      <span class="text-xl leading-none">{{ option.label }}</span>
      <span class="font-body text-[10px] tracking-wide">{{ option.hint }}</span>

      <template v-if="modelValue === option.size">
        <Doodle
          name="scribble"
          class="pointer-events-none absolute -top-3 -left-3.5 h-[112%] w-[122%] text-dusty-pink"
        />
        <Doodle name="star" class="absolute -right-2.5 -bottom-2.5 text-ink" width="17" height="17" />
      </template>
    </button>
  </div>
</template>
