<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useFavorites } from '@/composables/useFavorites'
import { useTelegram } from '@/composables/useTelegram'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const main = ref<HTMLElement | null>(null)
const { displayName } = useTelegram()
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
      <header
        class="flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-8"
      >
        <p class="truncate text-sm text-muted">Здравствуйте, {{ displayName }}</p>
        <ThemeToggle :theme="theme" @toggle="toggleTheme" />
      </header>
      <main ref="main" class="shell-main">
        <RouterView />
      </main>
    </div>
    <AppTabBar :favorite-count="savedIds.length" />
  </div>
</template>
