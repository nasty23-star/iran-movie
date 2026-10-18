<script setup lang="ts">
defineProps<{
  favoriteCount: number
}>()
</script>

<template>
  <nav class="tab-bar" aria-label="Разделы">
    <RouterLink to="/" class="tab-link">Главная</RouterLink>
    <RouterLink to="/oscar" class="tab-link">Оскар</RouterLink>
    <RouterLink to="/top" class="tab-link">Топ</RouterLink>
    <RouterLink to="/roulette" class="tab-link">Рандом</RouterLink>
    <RouterLink to="/favorites" class="tab-link">
      <span>Избранное</span>
      <span v-if="favoriteCount > 0" class="tab-count">{{ favoriteCount }}</span>
    </RouterLink>
  </nav>
</template>
