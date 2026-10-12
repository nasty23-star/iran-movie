import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const catalog = JSON.parse(readFileSync(path.join(root, 'src/data/catalog.json'), 'utf8'))
const recommendations = JSON.parse(
  readFileSync(path.join(root, 'src/data/recommendations.json'), 'utf8'),
)
const outDir = path.join(root, 'public', 'posters')

const palette = [
  '#e7f2fc',
  '#d3e6f8',
  '#a9cef2',
  '#78b0e6',
  '#4c91d6',
  '#2b72c4',
  '#1d5aa3',
  '#184882',
  '#143662',
  '#102848',
  '#0b1a30',
  '#07090c',
  '#f5f7f9',
  '#d5dee6',
  '#8b9bab',
  '#3c4a58',
  '#1a2129',
]

mkdirSync(outDir, { recursive: true })

function hash(id) {
  let value = 2166136261
  for (let index = 0; index < id.length; index += 1) {
    value ^= id.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

function random(seed) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let next = state
    next = Math.imul(next ^ (next >>> 15), next | 1)
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61)
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

function xml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function poster(film) {
  const rand = random(hash(film.id))
  const pick = () => palette[Math.floor(rand() * palette.length)]
  const background = pick()
  const first = pick()
  const second = pick()
  const third = pick()
  const ink = rand() > 0.5 ? '#f5f7f9' : '#0b1a30'
  const circleX = Math.round(40 + rand() * 280)
  const circleY = Math.round(50 + rand() * 250)
  const radius = Math.round(70 + rand() * 110)
  const bandTop = 180 + Math.round(rand() * 90)
  const bandBottom = 300 + Math.round(rand() * 80)
  const barWidth = 80 + Math.round(rand() * 170)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" role="img" aria-label="${xml(film.title)}">
  <rect width="400" height="600" fill="${background}"/>
  <circle cx="${circleX}" cy="${circleY}" r="${radius}" fill="${first}"/>
  <path d="M0 ${bandTop} L400 ${bandTop - 70} L400 ${bandBottom} L0 ${bandBottom + 50} Z" fill="${second}" opacity="0.88"/>
  <rect x="28" y="448" width="${barWidth}" height="8" fill="${third}"/>
  <text x="28" y="545" fill="${ink}" font-family="Georgia, serif" font-size="54">${film.year}</text>
  <rect x="16" y="16" width="368" height="568" fill="none" stroke="${ink}" stroke-opacity="0.35" stroke-width="2"/>
</svg>
`
}

const seen = new Set()

for (const film of [...catalog, ...recommendations]) {
  if (seen.has(film.id)) continue
  seen.add(film.id)
  writeFileSync(path.join(outDir, `${film.id}.svg`), poster(film), 'utf8')
}
