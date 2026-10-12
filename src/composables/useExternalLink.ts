export function imdbUrl(imdbId: string): string {
  return `https://www.imdb.com/title/${imdbId}/`
}

export interface UseExternalLink {
  openExternal: (url: string, event: MouseEvent) => void
}

export function useExternalLink(): UseExternalLink {
  function openExternal(url: string, event: MouseEvent) {
    const openLink = window.Telegram?.WebApp?.openLink
    if (!openLink) return
    event.preventDefault()
    openLink(url)
  }

  return { openExternal }
}
