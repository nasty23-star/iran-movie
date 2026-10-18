import { ref } from 'vue'
import type { Ref } from 'vue'
import type { TelegramCloudStorage } from '@/types/telegram'

const CLOUD_LIMIT = 4096
export const FAVORITE_NOTE_LIMIT = 200

export interface IdSnapshot {
  ids: string[]
  updatedAt: number
}

export interface NoteSnapshot {
  notes: Record<string, string>
  updatedAt: number
}

export interface IdCloudList {
  key: string
  ids: Ref<string[]>
  updatedAt: number
  mutated: boolean
}

export interface NoteCloudList {
  key: string
  notes: Ref<Record<string, string>>
  updatedAt: number
  mutated: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readUpdatedAt(record: Record<string, unknown>): number {
  const value = record.updatedAt
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function readStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const unique: string[] = []
  for (const item of value) {
    if (typeof item === 'string' && item.length > 0 && !unique.includes(item)) unique.push(item)
  }
  return unique
}

export function cleanNote(value: string): string {
  const clipped = value.slice(0, FAVORITE_NOTE_LIMIT)
  if (clipped.trim().length === 0) return ''
  return clipped
}

function readNoteMap(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {}
  const notes: Record<string, string> = {}
  for (const [id, note] of Object.entries(value)) {
    if (id.length === 0 || typeof note !== 'string') continue
    const text = cleanNote(note)
    if (text.length > 0) notes[id] = text
  }
  return notes
}

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeLocalSnapshot(key: string, json: string) {
  try {
    localStorage.setItem(key, json)
  } catch {
    // Список остаётся в памяти, если хранилище недоступно.
  }
}

export function serializeIdSnapshot(snapshot: IdSnapshot): string {
  return JSON.stringify({ ids: snapshot.ids, updatedAt: snapshot.updatedAt })
}

export function serializeNoteSnapshot(snapshot: NoteSnapshot): string {
  return JSON.stringify({ notes: snapshot.notes, updatedAt: snapshot.updatedAt })
}

export function parseIdSnapshot(raw: string): IdSnapshot | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || !Array.isArray(parsed.ids)) return null
    return { ids: readStrings(parsed.ids), updatedAt: readUpdatedAt(parsed) }
  } catch {
    return null
  }
}

export function parseNoteSnapshot(raw: string): NoteSnapshot | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null
    return { notes: readNoteMap(parsed.notes), updatedAt: readUpdatedAt(parsed) }
  } catch {
    return null
  }
}

function loadIdSnapshot(key: string): IdSnapshot {
  const raw = readRaw(key)
  if (!raw) return { ids: [], updatedAt: 0 }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      const snapshot = { ids: readStrings(parsed), updatedAt: Date.now() }
      writeLocalSnapshot(key, serializeIdSnapshot(snapshot))
      return snapshot
    }
    if (!isRecord(parsed)) return { ids: [], updatedAt: 0 }
    return { ids: readStrings(parsed.ids), updatedAt: readUpdatedAt(parsed) }
  } catch {
    return { ids: [], updatedAt: 0 }
  }
}

function loadNoteSnapshot(key: string): NoteSnapshot {
  const raw = readRaw(key)
  if (!raw) return { notes: {}, updatedAt: 0 }
  return parseNoteSnapshot(raw) ?? { notes: {}, updatedAt: 0 }
}

function telegramCloud(): TelegramCloudStorage | null {
  const app = window.Telegram?.WebApp
  if (!app?.CloudStorage) return null
  if (!app.initData && app.platform === 'unknown') return null
  return app.CloudStorage
}

function cloudGet(key: string): Promise<string | null | undefined> {
  const storage = telegramCloud()
  if (!storage) return Promise.resolve(null)
  return new Promise((resolve) => {
    storage.getItem(key, (error, value) => {
      if (error) {
        resolve(undefined)
        return
      }
      if (typeof value !== 'string' || value.length === 0) {
        resolve(null)
        return
      }
      resolve(value)
    })
  })
}

function cloudSet(key: string, json: string) {
  const storage = telegramCloud()
  if (!storage || json.length > CLOUD_LIMIT) return
  storage.setItem(key, json)
}

export function createIdCloudList(key: string): IdCloudList {
  const snapshot = loadIdSnapshot(key)
  return {
    key,
    ids: ref(snapshot.ids),
    updatedAt: snapshot.updatedAt,
    mutated: false,
  }
}

export function createNoteCloudList(key: string): NoteCloudList {
  const snapshot = loadNoteSnapshot(key)
  return {
    key,
    notes: ref(snapshot.notes),
    updatedAt: snapshot.updatedAt,
    mutated: false,
  }
}

export function publishIdCloudList(list: IdCloudList) {
  cloudSet(list.key, serializeIdSnapshot({ ids: list.ids.value, updatedAt: list.updatedAt }))
}

export function publishNoteCloudList(list: NoteCloudList) {
  cloudSet(list.key, serializeNoteSnapshot({ notes: list.notes.value, updatedAt: list.updatedAt }))
}

export function commitIdCloudList(list: IdCloudList, next: string[], user: boolean) {
  const updatedAt = user ? Date.now() : list.updatedAt
  list.ids.value = next
  list.updatedAt = updatedAt
  if (user) list.mutated = true
  writeLocalSnapshot(list.key, serializeIdSnapshot({ ids: next, updatedAt }))
  if (user) publishIdCloudList(list)
}

let noteCloudTimer: ReturnType<typeof setTimeout> | null = null

export function commitNoteCloudList(
  list: NoteCloudList,
  next: Record<string, string>,
  user: boolean,
) {
  const updatedAt = user ? Date.now() : list.updatedAt
  list.notes.value = next
  list.updatedAt = updatedAt
  if (user) list.mutated = true
  writeLocalSnapshot(list.key, serializeNoteSnapshot({ notes: next, updatedAt }))
  if (!user) return
  if (noteCloudTimer) clearTimeout(noteCloudTimer)
  noteCloudTimer = setTimeout(() => {
    noteCloudTimer = null
    publishNoteCloudList(list)
  }, 400)
}

export function pruneIdCloudList(list: IdCloudList, known: ReadonlySet<string>) {
  const next = list.ids.value.filter((id) => known.has(id))
  if (next.length === list.ids.value.length) return
  list.ids.value = next
  writeLocalSnapshot(list.key, serializeIdSnapshot({ ids: next, updatedAt: list.updatedAt }))
}

export function pruneNoteCloudList(
  list: NoteCloudList,
  allow: (id: string) => boolean,
  user: boolean,
): boolean {
  const next: Record<string, string> = {}
  let changed = false
  for (const [id, note] of Object.entries(list.notes.value)) {
    if (allow(id)) next[id] = note
    else changed = true
  }
  if (!changed) return false
  if (user) commitNoteCloudList(list, next, true)
  else {
    list.notes.value = next
    writeLocalSnapshot(list.key, serializeNoteSnapshot({ notes: next, updatedAt: list.updatedAt }))
  }
  return true
}

function replaceIdCloudList(list: IdCloudList, snapshot: IdSnapshot, known: ReadonlySet<string>) {
  const next = snapshot.ids.filter((id) => known.has(id))
  const pruned = next.length !== snapshot.ids.length
  list.ids.value = next
  list.updatedAt = pruned ? Date.now() : snapshot.updatedAt
  if (pruned) list.mutated = true
  writeLocalSnapshot(list.key, serializeIdSnapshot({ ids: next, updatedAt: list.updatedAt }))
  if (pruned) publishIdCloudList(list)
}

function replaceNoteCloudList(list: NoteCloudList, snapshot: NoteSnapshot) {
  list.notes.value = snapshot.notes
  list.updatedAt = snapshot.updatedAt
  writeLocalSnapshot(
    list.key,
    serializeNoteSnapshot({ notes: snapshot.notes, updatedAt: snapshot.updatedAt }),
  )
}

export function bootIdCloudList(
  list: IdCloudList,
  known: () => ReadonlySet<string>,
  onDone?: () => void,
) {
  if (!telegramCloud()) {
    onDone?.()
    return
  }
  void cloudGet(list.key).then((raw) => {
    if (list.mutated || raw === undefined) {
      if (list.mutated) publishIdCloudList(list)
      onDone?.()
      return
    }
    const remote = raw ? parseIdSnapshot(raw) : null
    if (!remote || remote.updatedAt <= list.updatedAt) {
      publishIdCloudList(list)
      onDone?.()
      return
    }
    if (list.mutated) {
      publishIdCloudList(list)
      onDone?.()
      return
    }
    replaceIdCloudList(list, remote, known())
    onDone?.()
  })
}

export function bootNoteCloudList(list: NoteCloudList, onDone?: () => void) {
  if (!telegramCloud()) {
    onDone?.()
    return
  }
  void cloudGet(list.key).then((raw) => {
    if (list.mutated || raw === undefined) {
      if (list.mutated) publishNoteCloudList(list)
      onDone?.()
      return
    }
    const remote = raw ? parseNoteSnapshot(raw) : null
    if (!remote || remote.updatedAt <= list.updatedAt) {
      publishNoteCloudList(list)
      onDone?.()
      return
    }
    if (list.mutated) {
      publishNoteCloudList(list)
      onDone?.()
      return
    }
    replaceNoteCloudList(list, remote)
    onDone?.()
  })
}
