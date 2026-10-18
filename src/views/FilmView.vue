<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BackHome from '@/components/BackHome.vue'
import FavoriteHeart from '@/components/FavoriteHeart.vue'
import FavoriteNote from '@/components/FavoriteNote.vue'
import FilmPoster from '@/components/FilmPoster.vue'
import FilmResultCard from '@/components/FilmResultCard.vue'
import { useCatalog } from '@/composables/useCatalog'
import { useExclusions } from '@/composables/useExclusions'
import { imdbUrl, useExternalLink } from '@/composables/useExternalLink'
import { useFavorites } from '@/composables/useFavorites'
import { useNativeChrome } from '@/composables/useTelegramChrome'
import type { Film, FilmCardModel } from '@/types/film'

const route = useRoute()
const { films, findById } = useCatalog()
const { isSaved, toggle, noteOf, setNote, shareFilm } = useFavorites()
const { isWatched, isBlocked, toggleWatched, toggleBlocked } = useExclusions()
const { openExternal } = useExternalLink()
const { nativeChrome } = useNativeChrome()
const shared = ref(false)
const shareFailed = ref(false)

const film = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? findById(id) : undefined
})
const similar = computed(() => {
  const current = film.value
  if (!current) return []
  return similarTo(current, films.value)
})
const rating = computed(() => (film.value ? film.value.imdbRating.toFixed(1) : ''))
const genresLabel = computed(() => film.value?.genres?.join(', ') ?? '')
const href = computed(() => (film.value ? imdbUrl(film.value.imdbId) : ''))
const saved = computed(() => (film.value ? isSaved(film.value.id) : false))
const watched = computed(() => (film.value ? isWatched(film.value.id) : false))
const blocked = computed(() => (film.value ? isBlocked(film.value.id) : false))
const note = computed(() => (film.value ? noteOf(film.value.id) : ''))
const watchedLabel = computed(() => (watched.value ? 'Убрать из просмотренного' : 'Просмотрено'))
const blockedLabel = computed(() =>
  blocked.value ? 'Убрать из чёрного списка' : 'В чёрный список',
)

function similarTo(current: FilmCardModel, catalog: Film[]): Film[] {
  const genres = current.genres ?? []
  const others = catalog.filter((item) => item.id !== current.id)
  const sameDirector = others
    .filter((item) => item.director === current.director)
    .toSorted(byRating)
  const sameGenre = others
    .filter(
      (item) =>
        item.director !== current.director && item.genres.some((genre) => genres.includes(genre)),
    )
    .toSorted(byRating)
  return [...sameDirector, ...sameGenre].slice(0, 6)
}

function byRating(left: Film, right: Film): number {
  return right.imdbRating - left.imdbRating || left.title.localeCompare(right.title, 'ru')
}

function onToggle() {
  if (!film.value) return
  toggle(film.value.id)
}

function onWatched() {
  if (!film.value) return
  toggleWatched(film.value.id)
}

function onBlocked() {
  if (!film.value) return
  toggleBlocked(film.value.id)
}

function onOpen(event: MouseEvent) {
  openExternal(href.value, event)
}

function onShare() {
  if (!film.value) return
  const ok = shareFilm(film.value)
  shared.value = ok
  shareFailed.value = !ok
}

function onNote(value: string) {
  if (!film.value) return
  setNote(film.value.id, value)
}

function onCardWatched(id: string) {
  toggleWatched(id)
}

function onCardBlocked(id: string) {
  toggleBlocked(id)
}

watch(
  () => route.params.id,
  () => {
    shared.value = false
    shareFailed.value = false
  },
)
</script>

<template>
  <section class="mx-auto flex max-w-4xl flex-col gap-6">
    <template v-if="film">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-display text-4xl">{{ film.title }}</h1>
        <BackHome v-if="!nativeChrome" />
      </div>
      <article class="card grid md:grid-cols-[11rem_1fr]">
        <FilmPoster :src="film.image" :title="film.title" />
        <div class="flex flex-col gap-3 p-4 md:p-5">
          <div class="flex items-start justify-between gap-3">
            <p class="rating">IMDb {{ rating }}</p>
            <FavoriteHeart :saved="saved" @toggle="onToggle" />
          </div>
          <p class="text-sm text-muted">{{ film.year }} · {{ film.director }}</p>
          <p v-if="genresLabel" class="text-sm text-muted">{{ genresLabel }}</p>
          <p v-if="film.oscarNote" class="text-sm font-semibold text-accent">
            {{ film.oscarNote }}
          </p>
          <p class="text-sm leading-6">{{ film.description }}</p>
          <p
            v-if="film.note"
            class="rounded-xl bg-surface-2 px-3 py-2 text-sm leading-6 text-muted"
          >
            {{ film.note }}
          </p>
          <div class="flex flex-wrap gap-2">
            <a
              :href="href"
              class="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
              @click="onOpen"
            >
              На IMDb
            </a>
            <button type="button" class="btn btn-secondary" @click="onShare">Поделиться</button>
            <button type="button" class="btn btn-secondary" @click="onWatched">
              {{ watchedLabel }}
            </button>
            <button type="button" class="btn btn-danger" @click="onBlocked">
              {{ blockedLabel }}
            </button>
          </div>
          <p v-if="shared" role="status" class="text-sm font-semibold text-accent">
            фильм готов к отправке
          </p>
          <p v-else-if="shareFailed" role="status" class="text-sm text-danger">
            Не удалось открыть Telegram
          </p>
          <FavoriteNote v-if="saved" :note="note" @update="onNote" />
        </div>
      </article>
      <section v-if="similar.length > 0" class="flex flex-col gap-3">
        <h2 class="font-display text-2xl">Похожие</h2>
        <div class="grid gap-3">
          <FilmResultCard
            v-for="item in similar"
            :key="item.id"
            :film="item"
            :saved="isSaved(item.id)"
            :watched="isWatched(item.id)"
            :blocked="isBlocked(item.id)"
            @toggle="toggle"
            @open-link="openExternal"
            @toggle-watched="onCardWatched"
            @toggle-blocked="onCardBlocked"
          />
        </div>
      </section>
    </template>
    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-display text-4xl">Фильм не найден</h1>
        <BackHome v-if="!nativeChrome" />
      </div>
      <p class="card px-4 py-8 text-center text-muted">Такого фильма нет в каталоге.</p>
    </template>
  </section>
</template>
