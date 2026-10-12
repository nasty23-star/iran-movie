export interface FilmCardModel {
  id: string
  title: string
  year: number
  director: string
  description: string
  imdbRating: number
  imdbId: string
  image: string
  note?: string
  oscarNote?: string
}

export interface Film extends FilmCardModel {
  oscarNominated: boolean
}

export interface Recommendation extends FilmCardModel {
  note: string
}
