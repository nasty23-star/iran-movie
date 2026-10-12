import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import FavoritesView from '@/views/FavoritesView.vue'
import HomeView from '@/views/HomeView.vue'
import OscarView from '@/views/OscarView.vue'
import RouletteView from '@/views/RouletteView.vue'
import TopView from '@/views/TopView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/oscar', name: 'oscar', component: OscarView },
  { path: '/top', name: 'top', component: TopView },
  { path: '/roulette', name: 'roulette', component: RouletteView },
  { path: '/favorites', name: 'favorites', component: FavoritesView },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
