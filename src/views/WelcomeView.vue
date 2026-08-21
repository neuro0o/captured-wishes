<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function begin() {
  router.push({ name: 'capture', params: { id: '1' } })
}
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
    <p class="text-sm uppercase tracking-[0.3em] text-ink/60">
      A birthday scrapbook made just for you
    </p>
    <h1 class="text-5xl text-ink sm:text-6xl">Captured Wishes</h1>
    <button
      type="button"
      class="mt-4 rounded-full bg-dusty-pink px-8 py-3 font-heading text-xl text-ink shadow-sm transition hover:brightness-95"
      @click="begin"
    >
      Open the scrapbook
    </button>
  </main>
</template>
