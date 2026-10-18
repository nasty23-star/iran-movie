<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  saved: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const label = computed(() => (props.saved ? 'В избранном' : 'В избранное'))

function onToggle() {
  emit('toggle')
}
</script>

<template>
  <button
    type="button"
    class="heart"
    :class="{ 'is-saved': saved }"
    :aria-pressed="saved"
    :aria-label="label"
    @click="onToggle"
  >
    <svg class="heart-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.2s-6.7-4.1-6.7-8.8A3.9 3.9 0 0 1 9.2 7.5c1.2 0 2.3.6 2.8 1.5.5-.9 1.6-1.5 2.8-1.5a3.9 3.9 0 0 1 3.9 3.9c0 4.7-6.7 8.8-6.7 8.8z"
      />
    </svg>
  </button>
</template>
