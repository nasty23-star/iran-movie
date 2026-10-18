<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useFavorites } from '@/composables/useFavorites'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const main = ref<HTMLElement | null>(null)
const { theme, toggleTheme } = useTheme()
const { savedIds } = useFavorites()

watch(
  () => route.fullPath,
  () => {
    main.value?.scrollTo({ top: 0 })
  },
)
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <AppSidebar :favorite-count="savedIds.length" />
    </aside>
    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <header class="flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-8">
        <p class="flex min-w-0 items-center gap-2 text-sm text-muted">
          <svg class="header-mark" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
            <path d="M4 9 6.6 4.5h3.1L7.4 9m2.8-4.5h3.2L11 9m2.6-4.5H20L16.2 9" />
          </svg>
          <span class="truncate">кино не для всех</span>
        </p>
        <ThemeToggle :theme="theme" @toggle="toggleTheme" />
      </header>
      <main ref="main" class="shell-main">
        <RouterView />
      </main>
    </div>
    <AppTabBar :favorite-count="savedIds.length" />
  </div>
</template>
