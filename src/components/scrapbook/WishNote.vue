<script setup lang="ts">
withDefaults(
  defineProps<{
    lines: string[]
    open?: boolean
  }>(),
  { open: false },
)
</script>

<template>
  <div
    class="w-full max-w-xs origin-top overflow-hidden rounded-lg bg-cream text-left shadow-[0_10px_25px_-10px_rgba(74,63,53,0.35)] transition-[max-height,padding] duration-700 ease-out"
    :class="open ? 'max-h-96 px-6 py-6' : 'max-h-5 px-6 py-2'"
  >
    <p
      v-for="(line, index) in lines"
      :key="index"
      class="font-heading text-xl leading-relaxed text-ink transition-opacity duration-500"
      :class="[index > 0 ? 'mt-3' : '', open ? 'opacity-100 delay-300' : 'opacity-0']"
    >
      {{ line }}
    </p>
  </div>
</template>
