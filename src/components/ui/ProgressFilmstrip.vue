<script setup lang="ts">
withDefaults(defineProps<{ current: number; total?: number }>(), { total: 3 })
</script>

<template>
  <div class="flex flex-col items-center gap-1.5">
    <div class="flex gap-1.5">
      <span
        v-for="n in total"
        :key="n"
        class="h-[18px] w-6 rounded-[2px] border-2"
        :class="
          n === current
            ? 'border-ink bg-dusty-pink'
            : n < current
              ? 'border-ink/60 bg-sage/60'
              : 'border-ink/30 bg-warm-white'
        "
      ></span>
    </div>
    <p class="font-hand text-[15px] text-ink/55">memory {{ current }} of {{ total }}</p>
  </div>
</template>
