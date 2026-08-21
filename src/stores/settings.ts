import { defineStore } from 'pinia'

import { loadSettings, saveSettings } from '@/db/db'
import type { GridSize } from '@/types/memory'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    gridSize: null as GridSize | null,
    soundEnabled: false,
    loaded: false,
  }),
  actions: {
    async load() {
      const record = await loadSettings()
      this.gridSize = record.gridSize
      this.soundEnabled = record.soundEnabled
      this.loaded = true
    },
    async setGridSize(size: GridSize) {
      this.gridSize = size
      await saveSettings({ key: 'app', gridSize: size, soundEnabled: this.soundEnabled })
    },
    async toggleSound() {
      this.soundEnabled = !this.soundEnabled
      await saveSettings({ key: 'app', gridSize: this.gridSize, soundEnabled: this.soundEnabled })
    },
  },
})
