<script setup lang="ts">
import { computed } from 'vue'

import type { ExportMemory } from '@/types/memory'

const props = defineProps<{
  memories: ExportMemory[]
  closing: { heading: string; signature: string }
}>()

const TAPE = ['#aacbdd', '#e8b9be', '#edd8a0']
const TILT = [-4, 3, -5]

// Scale the handwriting down for longer letters so each fits one page.
function wishFontSize(lines: string[]) {
  const chars = lines.join(' ').length
  if (chars > 800) return 16
  if (chars > 480) return 18
  return 21
}

const cover = computed(() => props.memories)
</script>

<template>
  <div class="cw-export">
    <!-- COVER -->
    <div class="export-page cover">
      <p class="kicker">a birthday scrapbook made just for you</p>
      <h1 class="title">Captured Wishes</h1>
      <svg class="squiggle" viewBox="0 0 300 14" fill="none" stroke="#e8b9be" stroke-width="4" stroke-linecap="round">
        <path d="M4 9c26-11 52 8 78 0s52-11 78 0 52 8 78 0 30-9 58-4" />
      </svg>

      <div class="collage">
        <div
          v-for="(m, i) in cover"
          :key="m.id"
          class="pol"
          :style="{ transform: `rotate(${TILT[i]}deg)`, marginLeft: i ? '-18px' : '0', zIndex: i === 1 ? 2 : 1 }"
        >
          <span class="tape" :style="{ background: TAPE[i] }"></span>
          <div class="photo">
            <img v-if="m.url" :src="m.url" alt="" />
          </div>
          <p class="cap">{{ m.title }}</p>
        </div>
      </div>

      <div class="rule"></div>
      <h2 class="closing">{{ closing.heading }}</h2>
      <p class="sign">{{ closing.signature }}</p>
    </div>

    <!-- ONE PAGE PER MEMORY -->
    <div v-for="(m, i) in memories" :key="m.id" class="export-page wish">
      <p class="wish-kicker">a wish for you &mdash; no. {{ i + 1 }}</p>
      <div class="pol wish-pol" :style="{ transform: `rotate(${TILT[i]}deg)` }">
        <span class="tape" :style="{ background: TAPE[i] }"></span>
        <div class="photo">
          <img v-if="m.url" :src="m.url" alt="" />
        </div>
      </div>
      <h2 class="wish-title">{{ m.title }}</h2>
      <div class="wish-body" :style="{ fontSize: `${wishFontSize(m.lines)}px` }">
        <p v-for="(line, li) in m.lines" :key="li">{{ line }}</p>
      </div>
      <p class="folio">{{ i + 1 }} / {{ memories.length }}</p>
    </div>
  </div>
</template>

<style scoped>
.cw-export {
  font-family: 'Inter', system-ui, sans-serif;
  color: #4a3f35;
}

.export-page {
  width: 794px;
  height: 1123px;
  overflow: hidden;
  background-color: #faf3e7;
  padding: 78px 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

/* --- cover --- */
.cover .kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: rgba(74, 63, 53, 0.55);
}
.cover .title {
  margin: 14px 0 0;
  font-family: 'Patrick Hand', cursive;
  font-size: 62px;
  line-height: 1.05;
  white-space: nowrap;
}
.cover .squiggle {
  width: 300px;
  height: 14px;
  margin-top: 10px;
}
.collage {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: 74px 0 0;
}
.pol {
  background: #fffef9;
  padding: 12px 12px 34px;
  border-radius: 2px;
  box-shadow: 0 18px 30px -16px rgba(74, 63, 53, 0.55);
  position: relative;
}
.pol .tape {
  position: absolute;
  top: -12px;
  left: 50%;
  width: 88px;
  height: 24px;
  transform: translateX(-50%) rotate(-6deg);
  opacity: 0.85;
  border: 1px solid rgba(255, 255, 255, 0.5);
}
.pol .photo {
  width: 186px;
  height: 186px;
  overflow: hidden;
  background: linear-gradient(135deg, #e8b9be, #aacbdd);
  border-radius: 2px;
}
.pol .photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pol .cap {
  margin: 12px 0 0;
  text-align: center;
  font-family: 'Caveat', cursive;
  font-size: 20px;
  color: rgba(74, 63, 53, 0.7);
}
.cover .rule {
  width: 260px;
  border-top: 2px dashed rgba(74, 63, 53, 0.28);
  margin: 96px 0 0;
}
.cover .closing {
  margin: 40px 0 0;
  font-family: 'Patrick Hand', cursive;
  font-size: 44px;
  font-weight: 400;
  line-height: 1.1;
  white-space: nowrap;
}
.cover .sign {
  margin: 10px 0 0;
  font-family: 'Caveat', cursive;
  font-size: 28px;
  color: rgba(74, 63, 53, 0.7);
}

/* --- wish pages --- */
.wish {
  justify-content: flex-start;
}
.wish-kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(74, 63, 53, 0.5);
}
.wish-pol {
  margin: 22px 0 0;
  padding: 12px 12px 28px;
}
.wish-pol .photo {
  width: 196px;
  height: 196px;
}
.wish-title {
  margin: 24px 0 0;
  font-family: 'Patrick Hand', cursive;
  font-size: 34px;
  font-weight: 400;
  line-height: 1.15;
  text-align: center;
}
.wish-body {
  margin: 18px 0 0;
  max-width: 620px;
  font-family: 'Caveat', cursive;
  line-height: 1.62;
  color: #4a3f35;
}
.wish-body p {
  margin: 0 0 14px;
}
.wish-body p:last-child {
  margin-bottom: 0;
}
.folio {
  margin: auto 0 0;
  font-family: 'Caveat', cursive;
  font-size: 18px;
  color: rgba(74, 63, 53, 0.4);
}
</style>
