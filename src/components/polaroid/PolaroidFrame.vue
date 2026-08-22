<script setup lang="ts">
withDefaults(
  defineProps<{
    imageUrl?: string | null
    caption?: string
    rotation?: number
  }>(),
  {
    imageUrl: null,
    caption: '',
    rotation: 0,
  },
)
</script>

<template>
  <div
    class="inline-block w-44 rounded-sm bg-warm-white p-3 pb-8 shadow-[0_10px_25px_-8px_rgba(74,63,53,0.35)]"
    :style="{ transform: `rotate(${rotation}deg)` }"
  >
    <div class="aspect-square w-full overflow-hidden bg-sky/30">
      <img v-if="imageUrl" :src="imageUrl" alt="" class="h-full w-full object-cover" />
    </div>
    <p v-if="caption" class="mt-3 text-center font-heading text-lg text-ink">{{ caption }}</p>
  </div>
</template>
