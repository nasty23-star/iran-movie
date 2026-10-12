export interface FilmCardModel {
  id: string
  title: string
  year: number
  director: string
  description: string
  imdbRating: number
  imdbId: string
  image: string
  genres?: string[]
  note?: string
  oscarNote?: string
}

export interface Film extends FilmCardModel {
  genres: string[]
  oscarNominated: boolean
}

export interface Recommendation extends FilmCardModel {
  note: string
}
