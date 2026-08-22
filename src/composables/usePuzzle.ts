import { computed, ref } from 'vue'

import type { GridSize } from '@/types/memory'

export type PieceRotation = 0 | 90 | 180 | 270

export interface PuzzlePieceState {
  /** Home cell index — also determines which image slice this piece shows. */
  id: number
  /** Current cell index in the grid. */
  currentIndex: number
  rotation: PieceRotation
}

const ROTATIONS: readonly PieceRotation[] = [0, 90, 180, 270]

function shuffled<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function isFullySolved(pieces: PuzzlePieceState[]): boolean {
  return pieces.every((piece) => piece.currentIndex === piece.id && piece.rotation === 0)
}

function createShuffledPieces(cellCount: number): PuzzlePieceState[] {
  const positions = shuffled(Array.from({ length: cellCount }, (_, i) => i))
  const pieces = Array.from({ length: cellCount }, (_, id) => ({
    id,
    currentIndex: positions[id],
    rotation: ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)],
  }))

  if (isFullySolved(pieces) && pieces.length > 1) {
    const [a, b] = pieces
    ;[a.currentIndex, b.currentIndex] = [b.currentIndex, a.currentIndex]
  }

  return pieces
}

export function usePuzzle(gridSize: GridSize) {
  const cellCount = gridSize * gridSize
  const pieces = ref<PuzzlePieceState[]>(createShuffledPieces(cellCount))

  const piecesByPosition = computed(() => {
    const arr: PuzzlePieceState[] = new Array(cellCount)
    for (const piece of pieces.value) arr[piece.currentIndex] = piece
    return arr
  })

  const isSolved = computed(() => isFullySolved(pieces.value))

  function swap(indexA: number, indexB: number) {
    if (indexA === indexB) return
    const pieceA = pieces.value.find((piece) => piece.currentIndex === indexA)
    const pieceB = pieces.value.find((piece) => piece.currentIndex === indexB)
    if (pieceA) pieceA.currentIndex = indexB
    if (pieceB) pieceB.currentIndex = indexA
  }

  function rotate(pieceId: number) {
    const piece = pieces.value.find((entry) => entry.id === pieceId)
    if (!piece) return
    const nextIndex = (ROTATIONS.indexOf(piece.rotation) + 1) % ROTATIONS.length
    piece.rotation = ROTATIONS[nextIndex]
  }

  return { pieces, piecesByPosition, isSolved, swap, rotate }
}
