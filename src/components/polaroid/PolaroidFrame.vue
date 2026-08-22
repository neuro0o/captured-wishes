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
    class="inline-block rounded-sm bg-warm-white p-3 pb-8 shadow-[0_10px_25px_-8px_rgba(74,63,53,0.35)]"
    :class="widthClass"
    :style="{ transform: `rotate(${rotation}deg)` }"
  >
    <div class="aspect-square w-full overflow-hidden bg-sky/30">
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
    <p v-if="caption" class="mt-3 text-center font-heading text-lg text-ink">{{ caption }}</p>
  </div>
</template>
