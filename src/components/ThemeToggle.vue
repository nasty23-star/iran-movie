<script setup lang="ts">
import type { ThemeName } from '@/composables/useTheme'

defineProps<{
  theme: ThemeName
}>()

const emit = defineEmits<{
  toggle: []
}>()

function onToggle() {
  emit('toggle')
}
</script>

<template>
  <button type="button" class="btn btn-secondary" @click="onToggle">
    {{ theme === 'dark' ? 'Светлая тема' : 'Тёмная тема' }}
  </button>
</template>
