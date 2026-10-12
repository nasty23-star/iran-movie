<script setup lang="ts">
import { computed, watch } from 'vue'

const query = defineModel<string>('query', { required: true })
const yearFrom = defineModel<string>('yearFrom', { required: true })
const yearTo = defineModel<string>('yearTo', { required: true })
const director = defineModel<string>('director', { required: true })
const genre = defineModel<string>('genre', { required: true })

const props = defineProps<{
  years: number[]
  directors: string[]
  genres: string[]
}>()

const emit = defineEmits<{
  reset: []
}>()

const periodYears = computed(() => [...props.years].toSorted((left, right) => left - right))
const yearsTo = computed(() => {
  const start = selectedYear(yearFrom.value)
  if (start === null) return periodYears.value
  return periodYears.value.filter((year) => year >= start)
})

function onReset() {
  emit('reset')
}

function selectedYear(value: string) {
  if (value === '') return null
  const year = Number(value)
  return Number.isInteger(year) ? year : null
}

watch(yearFrom, (value) => {
  const start = selectedYear(value)
  const end = selectedYear(yearTo.value)
  if (start !== null && end !== null && end < start) yearTo.value = ''
})
</script>

<template>
  <div class="card grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3 xl:items-end">
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
    <label class="field" for="film-year-from">
      <span class="field-label">С года</span>
      <select id="film-year-from" v-model="yearFrom" class="control">
        <option value="">С любого</option>
        <option v-for="item in periodYears" :key="item" :value="String(item)">{{ item }}</option>
      </select>
    </label>
    <label class="field" for="film-year-to">
      <span class="field-label">По год</span>
      <select id="film-year-to" v-model="yearTo" class="control">
        <option value="">По любой</option>
        <option v-for="item in yearsTo" :key="`to-${item}`" :value="String(item)">
          {{ item }}
        </option>
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
