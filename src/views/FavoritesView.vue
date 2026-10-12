<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BackHome from '@/components/BackHome.vue'
import FavoriteRow from '@/components/FavoriteRow.vue'
import { useCatalog } from '@/composables/useCatalog'
import { useFavorites } from '@/composables/useFavorites'

const { findById } = useCatalog()
const { savedIds, remove, shareFavorites } = useFavorites()
const exported = ref(false)
const exportFailed = ref(false)

const savedFilms = computed(() =>
  savedIds.value.flatMap((id) => {
    const film = findById(id)
    return film ? [film] : []
  }),
)

function onExport() {
  const ok = shareFavorites(savedFilms.value)
  exported.value = ok
  exportFailed.value = !ok
}

function onRemove(id: string) {
  remove(id)
}

watch(savedIds, () => {
  exported.value = false
  exportFailed.value = false
})
</script>

<template>
  <section class="mx-auto flex max-w-3xl flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-4xl">избранное</h1>
      <BackHome />
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="btn btn-primary"
        :disabled="savedFilms.length === 0"
        @click="onExport"
      >
        Экспорт в избранное Telegram
      </button>
      <p v-if="exported" role="status" class="text-sm font-semibold text-accent">
        список успешно экспортирован
      </p>
      <p v-else-if="exportFailed" role="status" class="text-sm text-danger">
        Не удалось открыть Telegram
      </p>
    </div>
    <p class="text-sm text-muted">Список откроется в Telegram: отправьте его в «Избранное».</p>
    <p v-if="savedFilms.length === 0" class="card px-4 py-8 text-center text-muted">
      В избранном пока пусто. Сохраните фильм с карточки в каталоге.
    </p>
    <ul v-else class="flex flex-col gap-3">
      <FavoriteRow v-for="film in savedFilms" :key="film.id" :film="film" @remove="onRemove" />
    </ul>
  </section>
</template>
