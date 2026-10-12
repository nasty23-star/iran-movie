<script setup lang="ts">
defineProps<{
  favoriteCount: number
}>()

const emit = defineEmits<{
  navigate: []
}>()

function onNavigate() {
  emit('navigate')
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="px-5 py-6">
      <RouterLink
        to="/"
        class="font-display text-3xl text-sidebar-ink no-underline"
        @click="onNavigate"
      >
        Иранское кино
      </RouterLink>
      <p class="mt-1 text-sm text-sidebar-muted">каталог</p>
    </div>
    <nav class="flex flex-1 flex-col gap-1 px-3 pb-6" aria-label="Категории">
      <RouterLink to="/" class="nav-link" @click="onNavigate">главная</RouterLink>
      <RouterLink to="/oscar" class="nav-link" @click="onNavigate">номинации на Оскар</RouterLink>
      <RouterLink to="/top" class="nav-link" @click="onNavigate">мой топ фильмов</RouterLink>
      <RouterLink to="/favorites" class="nav-link" @click="onNavigate">
        <span>избранное</span>
        <span v-if="favoriteCount > 0" class="nav-count">{{ favoriteCount }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
