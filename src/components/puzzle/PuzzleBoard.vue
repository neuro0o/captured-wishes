<script setup lang="ts">
import { ref } from 'vue'

import { usePuzzle, type PuzzlePieceState } from '@/composables/usePuzzle'
import type { GridSize } from '@/types/memory'

const props = defineProps<{
  imageUrl: string
  gridSize: GridSize
}>()

const emit = defineEmits<{ (e: 'solved'): void }>()

const { piecesByPosition, isSolved, swap, rotate } = usePuzzle(props.gridSize)

const boardRef = ref<HTMLDivElement | null>(null)

interface DragState {
  pieceId: number
  startIndex: number
  startX: number
  startY: number
  dx: number
  dy: number
  moved: boolean
  pointerId: number
}

const drag = ref<DragState | null>(null)
const DRAG_THRESHOLD = 6

function cellStyle(index: number) {
  const n = props.gridSize
  const col = index % n
  const row = Math.floor(index / n)
  return {
    top: `${(row / n) * 100}%`,
    left: `${(col / n) * 100}%`,
    width: `${100 / n}%`,
    height: `${100 / n}%`,
  }
}

function backgroundStyle(piece: PuzzlePieceState) {
  const n = props.gridSize
  const homeCol = piece.id % n
  const homeRow = Math.floor(piece.id / n)
  const denom = n - 1 || 1
  return {
    backgroundImage: `url(${props.imageUrl})`,
    backgroundSize: `${n * 100}% ${n * 100}%`,
    backgroundPosition: `${(homeCol / denom) * 100}% ${(homeRow / denom) * 100}%`,
  }
}

function isDraggingThis(piece: PuzzlePieceState) {
  const current = drag.value
  return current !== null && current.pieceId === piece.id && current.moved
}

function pieceTransform(piece: PuzzlePieceState) {
  const current = drag.value
  if (current && current.pieceId === piece.id && current.moved) {
    return `translate(${current.dx}px, ${current.dy}px) rotate(${piece.rotation}deg)`
  }
  return `rotate(${piece.rotation}deg)`
}

function onPointerDown(event: PointerEvent, piece: PuzzlePieceState) {
  if (isSolved.value) return
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  drag.value = {
    pieceId: piece.id,
    startIndex: piece.currentIndex,
    startX: event.clientX,
    startY: event.clientY,
    dx: 0,
    dy: 0,
    moved: false,
    pointerId: event.pointerId,
  }
}

function onPointerMove(event: PointerEvent) {
  const current = drag.value
  if (!current || event.pointerId !== current.pointerId) return
  current.dx = event.clientX - current.startX
  current.dy = event.clientY - current.startY
  if (!current.moved && Math.hypot(current.dx, current.dy) > DRAG_THRESHOLD) {
    current.moved = true
  }
}

function onPointerUp(event: PointerEvent) {
  const current = drag.value
  if (!current || event.pointerId !== current.pointerId) return

  if (!current.moved) {
    rotate(current.pieceId)
  } else if (boardRef.value) {
    const rect = boardRef.value.getBoundingClientRect()
    const n = props.gridSize
    const col = Math.min(n - 1, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * n)))
    const row = Math.min(n - 1, Math.max(0, Math.floor(((event.clientY - rect.top) / rect.height) * n)))
    swap(current.startIndex, row * n + col)
  }
  drag.value = null

  if (isSolved.value) emit('solved')
}
</script>

<template>
  <div
    ref="boardRef"
    class="relative aspect-square w-full max-w-sm touch-none select-none overflow-hidden rounded-2xl bg-ink/5"
    :data-solved="isSolved"
  >
    <div
      v-for="piece in piecesByPosition"
      :key="piece.id"
      class="absolute box-border"
      :class="[
        isSolved ? 'p-0' : 'p-0.5',
        isDraggingThis(piece)
          ? 'z-20 cursor-grabbing transition-none'
          : 'z-10 cursor-grab transition-all duration-300 ease-out',
      ]"
      :style="cellStyle(piece.currentIndex)"
      :data-piece-id="piece.id"
      :data-current-index="piece.currentIndex"
      :data-rotation="piece.rotation"
      @pointerdown="onPointerDown($event, piece)"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div
        class="h-full w-full transition-all duration-300"
        :class="
          isSolved ? 'rounded-none border-0 shadow-none' : 'rounded-sm border border-warm-white/70 shadow-sm'
        "
        :style="{ ...backgroundStyle(piece), transform: pieceTransform(piece) }"
      />
    </div>
  </div>
</template>
