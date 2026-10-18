<script setup lang="ts">
defineProps<{
  favoriteCount: number
}>()
</script>

<template>
  <nav class="tab-bar" aria-label="Разделы">
    <RouterLink to="/" class="tab-link">
      <span class="tab-icon-wrap">
        <svg class="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
        </svg>
      </span>
      <span>Главная</span>
    </RouterLink>
    <RouterLink to="/oscar" class="tab-link">
      <span class="tab-icon-wrap">
        <svg class="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 3.2 2.3 4.7 5.2.7-3.8 3.6.9 5.2L12 15.1 7.4 17.4l.9-5.2L4.5 8.6l5.2-.7z" />
        </svg>
      </span>
      <span>Оскар</span>
    </RouterLink>
    <RouterLink to="/top" class="tab-link">
      <span class="tab-icon-wrap">
        <svg class="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 7h12M8 12h12M8 17h12" />
          <circle class="tab-dot" cx="4.5" cy="7" r="1.05" />
          <circle class="tab-dot" cx="4.5" cy="12" r="1.05" />
          <circle class="tab-dot" cx="4.5" cy="17" r="1.05" />
        </svg>
      </span>
      <span>Топ</span>
    </RouterLink>
    <RouterLink to="/roulette" class="tab-link">
      <span class="tab-icon-wrap">
        <svg class="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <circle class="tab-dot" cx="9" cy="9" r="1.15" />
          <circle class="tab-dot" cx="15" cy="9" r="1.15" />
          <circle class="tab-dot" cx="12" cy="12" r="1.15" />
          <circle class="tab-dot" cx="9" cy="15" r="1.15" />
          <circle class="tab-dot" cx="15" cy="15" r="1.15" />
        </svg>
      </span>
      <span>Рандом</span>
    </RouterLink>
    <RouterLink to="/favorites" class="tab-link">
      <span class="tab-icon-wrap">
        <svg class="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 20.2s-6.7-4.1-6.7-8.8A3.9 3.9 0 0 1 9.2 7.5c1.2 0 2.3.6 2.8 1.5.5-.9 1.6-1.5 2.8-1.5a3.9 3.9 0 0 1 3.9 3.9c0 4.7-6.7 8.8-6.7 8.8z"
          />
        </svg>
        <span v-if="favoriteCount > 0" class="tab-count">{{ favoriteCount }}</span>
      </span>
      <span>Избранное</span>
    </RouterLink>
  </nav>
</template>
