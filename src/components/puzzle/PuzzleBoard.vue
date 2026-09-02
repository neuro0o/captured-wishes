<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

import { playSfx } from '@/composables/useAudio'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { rotationDegrees, usePuzzle, type PuzzlePieceState } from '@/composables/usePuzzle'
import type { GridSize } from '@/types/memory'

const props = defineProps<{
  imageUrl: string
  gridSize: GridSize
}>()

const emit = defineEmits<{ (e: 'solved'): void }>()

const { piecesByPosition, isSolved, swap, rotate } = usePuzzle(props.gridSize)
const reducedMotion = useReducedMotion()

const boardRef = ref<HTMLDivElement | null>(null)

// Piece ids currently playing their snap flourish, and the one-shot board ring
// pulse on the final piece. Both are visual-only and skipped under reduced motion.
const snapping = ref<Set<number>>(new Set())
const solvePulse = ref(false)
const flourishTimers: number[] = []
onBeforeUnmount(() => flourishTimers.forEach((t) => window.clearTimeout(t)))

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

// Which pieces are currently home + upright, so we fire the "snap" cue only on
// the transition into that state (and not again while it stays there).
const settledPieces = new Set<number>()

function onSettleChanged() {
  const newlySettled: number[] = []
  for (const piece of piecesByPosition.value) {
    if (!piece) continue
    const settled = piece.currentIndex === piece.id && rotationDegrees(piece.rotationSteps) === 0
    if (settled && !settledPieces.has(piece.id)) {
      settledPieces.add(piece.id)
      newlySettled.push(piece.id)
    } else if (!settled) {
      settledPieces.delete(piece.id)
    }
  }
  // The last piece landing fires `solved` → `puzzle-finished` + the board pulse,
  // which stand in for the per-piece snap so the two don't stack.
  if (!newlySettled.length || isSolved.value) return

  playSfx('puzzle-solved-snap')
  if (reducedMotion.value) return
  for (const id of newlySettled) {
    snapping.value.add(id)
    flourishTimers.push(window.setTimeout(() => snapping.value.delete(id), 650))
  }
}

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
  const degrees = piece.rotationSteps * 90
  if (current && current.pieceId === piece.id && current.moved) {
    return `translate(${current.dx}px, ${current.dy}px) rotate(${degrees}deg)`
  }
  return `rotate(${degrees}deg)`
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
    playSfx('puzzle-rotate')
  } else if (boardRef.value) {
    const rect = boardRef.value.getBoundingClientRect()
    const n = props.gridSize
    const col = Math.min(n - 1, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * n)))
    const row = Math.min(n - 1, Math.max(0, Math.floor(((event.clientY - rect.top) / rect.height) * n)))
    swap(current.startIndex, row * n + col)
  }
  drag.value = null

  onSettleChanged()
  if (isSolved.value) {
    if (!reducedMotion.value) {
      solvePulse.value = true
      flourishTimers.push(window.setTimeout(() => (solvePulse.value = false), 950))
    }
    emit('solved')
  }
}
</script>

<template>
  <div
    ref="boardRef"
    class="relative aspect-square w-full max-w-sm touch-none rounded-md bg-cream transition-shadow duration-500 select-none"
    :class="[
      isSolved
        ? 'shadow-[0_0_0_3px_rgba(237,216,160,0.9),0_18px_34px_-16px_rgba(74,63,53,0.5)] overflow-visible'
        : 'overflow-hidden',
      solvePulse && 'board-solve-pulse',
    ]"
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
        snapping.has(piece.id) && 'piece-snap',
      ]"
      :style="cellStyle(piece.currentIndex)"
      :data-piece-id="piece.id"
      :data-current-index="piece.currentIndex"
      :data-rotation="rotationDegrees(piece.rotationSteps)"
      @pointerdown="onPointerDown($event, piece)"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div
        class="h-full w-full bg-cover transition-all duration-300"
        :class="
          isSolved
            ? 'rounded-none border-0 shadow-none'
            : 'rounded-xs border-2 border-warm-white shadow-[0_3px_7px_rgba(74,63,53,0.28)]'
        "
        :style="{ ...backgroundStyle(piece), transform: pieceTransform(piece) }"
      />
    </div>
  </div>
</template>
