<script setup lang="ts">
import { computed } from 'vue'
import type { ThemeName } from '@/composables/useTheme'

const props = defineProps<{
  theme: ThemeName
}>()

const emit = defineEmits<{
  toggle: []
}>()

const label = computed(() => (props.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'))

function onToggle() {
  emit('toggle')
}
</script>

<template>
  <button type="button" class="btn btn-secondary theme-toggle" :aria-label="label" @click="onToggle">
    <span class="theme-label">{{ label }}</span>
    <svg v-if="theme === 'dark'" class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2.2v2.2M12 19.6V21.8M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.2 12h2.2M19.6 12h2.2M4.4 19.6 6 18M18 6l1.6-1.6"
      />
    </svg>
    <svg v-else class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 14.8A8.2 8.2 0 0 1 9.2 4 6.6 6.6 0 1 0 20 14.8z" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
}

.theme-label {
  display: none;
}

.theme-icon {
  width: 1.35rem;
  height: 1.35rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.theme-icon circle {
  fill: currentColor;
  stroke: none;
}

@media (min-width: 768px) {
  .theme-toggle {
    width: auto;
    height: auto;
    padding: 0.7rem 1.15rem;
  }

  .theme-label {
    display: inline;
  }

  .theme-icon {
    display: none;
  }
}
</style>
