<script setup lang="ts">
import { ref, watch } from 'vue'
import { FAVORITE_NOTE_LIMIT } from '@/composables/idCloud'

const props = defineProps<{
  note: string
}>()

const emit = defineEmits<{
  update: [value: string]
}>()

const draft = ref(props.note)

watch(
  () => props.note,
  (value) => {
    draft.value = value
  },
)

function onInput() {
  emit('update', draft.value)
}

function onChange() {
  emit('update', draft.value.trim())
}
</script>

<template>
  <label class="field">
    <span class="field-label">Заметка</span>
    <textarea
      v-model="draft"
      class="control"
      rows="2"
      :maxlength="FAVORITE_NOTE_LIMIT"
      @input="onInput"
      @change="onChange"
    />
  </label>
</template>
