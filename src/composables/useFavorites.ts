import { computed, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { catalogFilmIds } from '@/composables/useCatalog'
import { imdbUrl } from '@/composables/useExternalLink'
import {
  bootIdCloudList,
  bootNoteCloudList,
  cleanNote,
  commitIdCloudList,
  commitNoteCloudList,
  createIdCloudList,
  createNoteCloudList,
  pruneIdCloudList,
  pruneNoteCloudList,
} from '@/composables/idCloud'
import type { FilmCardModel } from '@/types/film'

export interface UseFavorites {
  savedIds: ComputedRef<string[]>
  isSaved: (id: string) => boolean
  toggle: (id: string) => void
  remove: (id: string) => void
  restore: (id: string, note: string) => void
  noteOf: (id: string) => string
  setNote: (id: string, value: string) => void
  shareFavorites: (films: FilmCardModel[]) => boolean
  shareFilm: (film: FilmCardModel) => boolean
}

const IDS_KEY = 'iran-cinema-favorites'
const NOTES_KEY = 'iran-cinema-favorite-notes'
const saved = createIdCloudList(IDS_KEY)
const noteList = createNoteCloudList(NOTES_KEY)

watch(
  catalogFilmIds,
  (known) => {
    pruneIdCloudList(saved, known)
    pruneNoteCloudList(noteList, (id) => known.has(id), false)
  },
  { immediate: true },
)

let savedReady = false
let notesReady = false

function settleNotes() {
  if (!savedReady || !notesReady) return
  pruneNoteCloudList(noteList, (id) => saved.ids.value.includes(id), true)
}

bootIdCloudList(
  saved,
  () => catalogFilmIds.value,
  () => {
    savedReady = true
    settleNotes()
  },
)
bootNoteCloudList(noteList, () => {
  notesReady = true
  settleNotes()
})

function filmLine(film: FilmCardModel): string {
  return `${film.title} (${film.year}), IMDb ${film.imdbRating.toFixed(1)} — ${imdbUrl(film.imdbId)}`
}

function shareText(films: FilmCardModel[]): string {
  return ['Иранское кино. Избранное', ...films.map((film) => filmLine(film))].join('\n')
}

function openShare(url: string): boolean {
  const webApp = window.Telegram?.WebApp
  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(url)
    return true
  }
  const popup = window.open(url, '_blank', 'noopener,noreferrer')
  return popup !== null
}

export function useFavorites(): UseFavorites {
  const savedIds = computed(() => saved.ids.value)

  function isSaved(id: string) {
    return saved.ids.value.includes(id)
  }

  function add(id: string) {
    if (isSaved(id)) return
    commitIdCloudList(saved, [...saved.ids.value, id], true)
  }

  function remove(id: string) {
    if (!isSaved(id)) return
    commitIdCloudList(
      saved,
      saved.ids.value.filter((item) => item !== id),
      true,
    )
    if (!noteList.notes.value[id]) return
    const next = { ...noteList.notes.value }
    delete next[id]
    commitNoteCloudList(noteList, next, true)
  }

  function toggle(id: string) {
    if (isSaved(id)) remove(id)
    else add(id)
  }

  function restore(id: string, note: string) {
    if (!catalogFilmIds.value.has(id)) return
    if (!isSaved(id)) commitIdCloudList(saved, [...saved.ids.value, id], true)
    const text = cleanNote(note)
    if (text.length === 0) return
    setNote(id, text)
  }

  function noteOf(id: string) {
    return noteList.notes.value[id] ?? ''
  }

  function setNote(id: string, value: string) {
    if (!isSaved(id)) return
    const text = cleanNote(value)
    const current = noteList.notes.value[id] ?? ''
    if (text === current) return
    const next = { ...noteList.notes.value }
    if (text.length === 0) delete next[id]
    else next[id] = text
    commitNoteCloudList(noteList, next, true)
  }

  function shareFavorites(films: FilmCardModel[]): boolean {
    if (films.length === 0) return false
    const params = new URLSearchParams({
      url: 'https://www.imdb.com/',
      text: shareText(films),
    })
    return openShare(`https://t.me/share/url?${params.toString()}`)
  }

  function shareFilm(film: FilmCardModel): boolean {
    const params = new URLSearchParams({
      url: imdbUrl(film.imdbId),
      text: filmLine(film),
    })
    return openShare(`https://t.me/share/url?${params.toString()}`)
  }

  return {
    savedIds,
    isSaved,
    toggle,
    remove,
    restore,
    noteOf,
    setNote,
    shareFavorites,
    shareFilm,
  }
}
