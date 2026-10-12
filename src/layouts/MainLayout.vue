<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useFavorites } from '@/composables/useFavorites'
import { useSidebar } from '@/composables/useSidebar'
import { useTelegram } from '@/composables/useTelegram'
import { useTheme } from '@/composables/useTheme'

const { displayName } = useTelegram()
const { theme, toggleTheme } = useTheme()
const { savedIds } = useFavorites()
const { open, toggle, close } = useSidebar()
</script>

<template>
  <div class="min-h-dvh md:flex">
    <button
      v-if="open"
      type="button"
      class="fixed inset-0 z-30 bg-black/50 md:hidden"
      aria-label="Закрыть меню"
      @click="close"
    />
    <aside class="sidebar" :class="{ 'is-open': open }">
      <AppSidebar :favorite-count="savedIds.length" @navigate="close" />
    </aside>
    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-8"
      >
        <div class="flex min-w-0 items-center gap-3">
          <button
            type="button"
            class="btn btn-secondary md:hidden"
            :aria-expanded="open"
            @click="toggle"
          >
            {{ open ? 'Закрыть' : 'Категории' }}
          </button>
          <p class="truncate text-sm text-muted">Здравствуйте, {{ displayName }}</p>
        </div>
        <ThemeToggle :theme="theme" @toggle="toggleTheme" />
      </header>
      <main class="flex-1 px-4 py-6 md:px-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
