<script setup lang="ts">
const query = defineModel<string>('query', { required: true })
const year = defineModel<string>('year', { required: true })
const director = defineModel<string>('director', { required: true })
const genre = defineModel<string>('genre', { required: true })

defineProps<{
  years: number[]
  directors: string[]
  genres: string[]
}>()

const emit = defineEmits<{
  reset: []
}>()

function onReset() {
  emit('reset')
}
</script>

<template>
  <div
    class="card grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_8.5rem_minmax(0,1fr)_minmax(0,0.8fr)_auto] xl:items-end"
  >
    <label class="field" for="film-query">
      <span class="field-label">Поиск по названию</span>
      <input
        id="film-query"
        v-model="query"
        class="control"
        type="search"
        placeholder="Название фильма"
        autocomplete="off"
      />
    </label>
    <label class="field" for="film-year">
      <span class="field-label">Год</span>
      <select id="film-year" v-model="year" class="control">
        <option value="">Все годы</option>
        <option v-for="item in years" :key="item" :value="String(item)">{{ item }}</option>
      </select>
    </label>
    <label class="field" for="film-director">
      <span class="field-label">Режиссёр</span>
      <select id="film-director" v-model="director" class="control">
        <option value="">Все режиссёры</option>
        <option v-for="item in directors" :key="item" :value="item">{{ item }}</option>
      </select>
    </label>
    <label class="field" for="film-genre">
      <span class="field-label">Жанр</span>
      <select id="film-genre" v-model="genre" class="control">
        <option value="">Все жанры</option>
        <option v-for="item in genres" :key="item" :value="item">{{ item }}</option>
      </select>
    </label>
    <button type="button" class="btn btn-secondary" @click="onReset">Сбросить фильтры</button>
  </div>
</template>
