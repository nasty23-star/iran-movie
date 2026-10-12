<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  src: string
  title: string
}>()

const failed = ref(false)
const posterAlt = computed(() => `Постер: ${props.title}`)
const imageSrc = computed(() => {
  if (!props.src.startsWith('/')) return props.src
  return `${import.meta.env.BASE_URL}${props.src.slice(1)}`
})

watch(
  () => props.src,
  () => {
    failed.value = false
  },
)

function onError() {
  failed.value = true
}
</script>

<template>
  <div class="relative aspect-[2/3] overflow-hidden bg-sidebar">
    <img
      v-if="!failed"
      :src="imageSrc"
      :alt="posterAlt"
      class="h-full w-full object-cover"
      loading="lazy"
      @error="onError"
    />
    <div v-else class="flex h-full items-end bg-sidebar p-3 text-sm text-sidebar-ink">
      {{ title }}
    </div>
  </div>
</template>
