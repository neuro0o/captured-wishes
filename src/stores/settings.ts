import { defineStore } from 'pinia'

import { loadSettings, saveSettings } from '@/db/db'
import type { GridSize } from '@/types/memory'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    gridSize: null as GridSize | null,
    sfxEnabled: true,
    musicEnabled: true,
    loaded: false,
  }),
  actions: {
    async load() {
      const record = await loadSettings()
      this.gridSize = record.gridSize
      this.sfxEnabled = record.sfxEnabled
      this.musicEnabled = record.musicEnabled
      this.loaded = true
    },
    async persist() {
      await saveSettings({
        key: 'app',
        gridSize: this.gridSize,
        sfxEnabled: this.sfxEnabled,
        musicEnabled: this.musicEnabled,
      })
    },
    async setGridSize(size: GridSize) {
      this.gridSize = size
      await this.persist()
    },
    async toggleSfx() {
      this.sfxEnabled = !this.sfxEnabled
      await this.persist()
    },
    async toggleMusic() {
      this.musicEnabled = !this.musicEnabled
      await this.persist()
    },
    /** Clears the grid-size choice so it's asked again; leaves the sound preferences alone. */
    async resetGridSize() {
      this.gridSize = null
      await this.persist()
    },
  },
})
