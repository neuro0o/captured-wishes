<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    /** Fill colour for primary/secondary (theme colour token name). */
    tone?: 'dusty-pink' | 'lavender' | 'sage' | 'sky' | 'soft-yellow' | 'warm-white'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'primary', tone: 'lavender', size: 'md', type: 'button', disabled: false },
)

const toneBg: Record<string, string> = {
  'dusty-pink': 'bg-dusty-pink',
  lavender: 'bg-lavender',
  sage: 'bg-sage',
  sky: 'bg-sky',
  'soft-yellow': 'bg-soft-yellow',
  'warm-white': 'bg-warm-white',
}

const sizeClass = computed(
  () =>
    ({
      sm: 'px-4 py-2 text-base rounded-xl shadow-craft-sm',
      md: 'px-7 py-3 text-xl rounded-2xl shadow-craft',
      lg: 'px-9 py-3.5 text-2xl rounded-2xl shadow-craft-lg',
    })[props.size],
)

const fillClass = computed(() =>
  props.variant === 'ghost' ? 'bg-transparent' : toneBg[props.tone],
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 border-[2.5px] border-ink font-heading text-ink transition active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-x-0 disabled:active:translate-y-0"
    :class="[sizeClass, fillClass]"
  >
    <slot />
  </button>
</template>
