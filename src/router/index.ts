import { createRouter, createWebHashHistory } from 'vue-router'

import WelcomeView from '@/views/WelcomeView.vue'
import CaptureView from '@/views/CaptureView.vue'
import PuzzleView from '@/views/PuzzleView.vue'
import WishView from '@/views/WishView.vue'
import ScrapbookView from '@/views/ScrapbookView.vue'

// Hash history is used deliberately: this ships as a static site on
// GitHub Pages with no server-side rewrites, so a direct/refreshed deep
// link into e.g. /puzzle/2 must resolve without a 404.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'welcome', component: WelcomeView },
    { path: '/capture/:id', name: 'capture', component: CaptureView, props: true },
    { path: '/puzzle/:id', name: 'puzzle', component: PuzzleView, props: true },
    { path: '/wish/:id', name: 'wish', component: WishView, props: true },
    { path: '/scrapbook', name: 'scrapbook', component: ScrapbookView },
  ],
})

export default router
