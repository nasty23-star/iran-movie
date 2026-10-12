import { computed, shallowRef } from 'vue'
import type { ComputedRef, ShallowRef } from 'vue'
import catalogJson from '@/data/catalog.json'
import recommendationsJson from '@/data/recommendations.json'
import type { Film, FilmCardModel, Recommendation } from '@/types/film'

export interface UseCatalog {
  films: ShallowRef<Film[]>
  recommendations: ShallowRef<Recommendation[]>
  years: ComputedRef<number[]>
  directors: ComputedRef<string[]>
  genres: ComputedRef<string[]>
  oscarFilms: ComputedRef<Film[]>
  findById: (id: string) => FilmCardModel | undefined
}

const films = shallowRef(parseList(catalogJson, parseFilm))
const recommendations = shallowRef(parseList(recommendationsJson, parseRecommendation))

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

function readNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readBoolean(record: Record<string, unknown>, key: string): boolean | null {
  const value = record[key]
  return typeof value === 'boolean' ? value : null
}

function readGenres(record: Record<string, unknown>): string[] | null {
  const value = record.genres
  if (!Array.isArray(value) || value.length === 0) return null
  const genres = value.filter((item): item is string => typeof item === 'string' && item.length > 0)
  return genres.length === value.length ? genres : null
}

function parseList<T>(input: unknown, parse: (value: unknown) => T | null): T[] {
  if (!Array.isArray(input)) return []
  return input.flatMap((item) => {
    const parsed = parse(item)
    return parsed ? [parsed] : []
  })
}

function parseFilm(value: unknown): Film | null {
  if (!isRecord(value)) return null
  const id = readString(value, 'id')
  const title = readString(value, 'title')
  const year = readNumber(value, 'year')
  const director = readString(value, 'director')
  const description = readString(value, 'description')
  const imdbRating = readNumber(value, 'imdbRating')
  const imdbId = readString(value, 'imdbId')
  const image = readString(value, 'image')
  const genres = readGenres(value)
  const oscarNominated = readBoolean(value, 'oscarNominated')
  if (
    id === null ||
    title === null ||
    year === null ||
    director === null ||
    description === null ||
    imdbRating === null ||
    imdbId === null ||
    image === null ||
    genres === null ||
    oscarNominated === null
  ) {
    return null
  }

  const film: Film = {
    id,
    title,
    year,
    director,
    description,
    imdbRating,
    imdbId,
    image,
    genres,
    oscarNominated,
  }
  const oscarNote = value.oscarNote
  if (typeof oscarNote === 'string' && oscarNote.length > 0) film.oscarNote = oscarNote
  return film
}

function parseRecommendation(value: unknown): Recommendation | null {
  if (!isRecord(value)) return null
  const id = readString(value, 'id')
  const title = readString(value, 'title')
  const year = readNumber(value, 'year')
  const director = readString(value, 'director')
  const description = readString(value, 'description')
  const imdbRating = readNumber(value, 'imdbRating')
  const imdbId = readString(value, 'imdbId')
  const image = readString(value, 'image')
  const note = readString(value, 'note')
  if (
    id === null ||
    title === null ||
    year === null ||
    director === null ||
    description === null ||
    imdbRating === null ||
    imdbId === null ||
    image === null ||
    note === null
  ) {
    return null
  }

  return { id, title, year, director, description, imdbRating, imdbId, image, note }
}

export function useCatalog(): UseCatalog {
  const years = computed(() =>
    [...new Set(films.value.map((film) => film.year))].toSorted((left, right) => right - left),
  )

  const directors = computed(() =>
    [...new Set(films.value.map((film) => film.director))].toSorted((left, right) =>
      left.localeCompare(right, 'ru'),
    ),
  )

  const genres = computed(() =>
    [...new Set(films.value.flatMap((film) => film.genres))].toSorted((left, right) =>
      left.localeCompare(right, 'ru'),
    ),
  )

  const oscarFilms = computed(() =>
    films.value
      .filter((film) => film.oscarNominated)
      .toSorted((left, right) => right.year - left.year),
  )

  function findById(id: string): FilmCardModel | undefined {
    return (
      films.value.find((film) => film.id === id) ??
      recommendations.value.find((film) => film.id === id)
    )
  }

  return { films, recommendations, years, directors, genres, oscarFilms, findById }
}
