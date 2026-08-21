<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <main class="flex min-h-screen items-center justify-center px-6 text-center">
    <p class="text-2xl">Puzzle view — memory #{{ id }}</p>
  </main>
</template>
