<script setup lang="ts">
withDefaults(
  defineProps<{
    imageUrl?: string | null
    caption?: string
    rotation?: number
    developing?: boolean
    widthClass?: string
  }>(),
  {
    imageUrl: null,
    caption: '',
    rotation: 0,
    developing: false,
    widthClass: 'w-44',
  },
)
</script>

<template>
  <div
    class="relative inline-block rounded-[3px] bg-warm-white p-3 pb-9 shadow-[0_16px_30px_-14px_rgba(74,63,53,0.55)]"
    :class="widthClass"
    :style="{ transform: `rotate(${rotation}deg)` }"
  >
    <!-- decoration slot: tape, pin, photo corners placed by the parent -->
    <slot />

    <div class="aspect-square w-full overflow-hidden rounded-xs bg-sky/30">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        alt=""
        class="h-full w-full object-cover transition-all duration-1800 ease-out"
        :class="
          developing
            ? 'scale-110 opacity-40 blur-md brightness-125 saturate-50'
            : 'scale-100 opacity-100 blur-none brightness-100 saturate-100'
        "
      />
    </div>
    <p v-if="caption" class="mt-2 text-center font-hand text-lg text-ink/70">{{ caption }}</p>
  </div>
</template>
