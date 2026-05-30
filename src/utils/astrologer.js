/**
 * Calls the Astrologer API on RapidAPI to fetch a natal chart.
 * Docs: https://rapidapi.com/astrologer/api/astrologer
 *
 * @param {object} params
 * @param {string} params.apiKey  - RapidAPI key
 * @param {string} params.name
 * @param {string} params.date    - "YYYY-MM-DD"
 * @param {string} params.time    - "HH:MM"
 * @param {string} params.place   - city / place string
 */
export async function fetchNatalChart({ apiKey, name, date, time, place }) {
  if (!apiKey) throw new Error('Introduce tu API key de RapidAPI primero.')

  // Build date/time parts
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = (time || '12:00').split(':').map(Number)

  // Astrologer API v2 endpoint — western natal chart
  const url = 'https://astrologer.p.rapidapi.com/api/v2/birth-chart'

  const body = {
    subject: {
      name,
      year,
      month,
      day,
      hour,
      minute,
      longitude: 0,   // will be geocoded server-side via city
      latitude: 0,
      city: place,
      nation: '',
      timezone: 'UTC',
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'astrologer.p.rapidapi.com',
      'x-rapidapi-key': apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Error ${response.status}: ${text}`)
  }

  return response.json()
}

/**
 * Formats the raw natal chart JSON into human-readable text.
 */
export function formatNatalChart(data, profileName) {
  if (!data) return ''

  const lines = [`✦ CARTA NATAL — ${profileName.toUpperCase()} ✦`, '']

  // Subject info
  if (data.subject) {
    const s = data.subject
    lines.push(`Nombre: ${s.name ?? profileName}`)
    if (s.year) lines.push(`Fecha: ${s.day}/${s.month}/${s.year} ${s.hour ?? ''}:${String(s.minute ?? '0').padStart(2,'0')}`)
    if (s.city) lines.push(`Lugar: ${s.city}`)
    lines.push('')
  }

  // Sun, Moon, Ascendant
  const planets = data.planets ?? data.planets_degrees_ut ?? []
  if (Array.isArray(planets) && planets.length) {
    lines.push('── PLANETAS ──')
    for (const p of planets) {
      const name = p.name ?? p.planet ?? p.id ?? '?'
      const sign = p.sign ?? p.zodiac_sign ?? ''
      const deg  = p.position != null ? `${Number(p.position).toFixed(2)}°` : (p.abs_pos != null ? `${Number(p.abs_pos).toFixed(2)}°` : '')
      const house = p.house != null ? ` Casa ${p.house}` : ''
      const retro = p.retrograde ? ' ℞' : ''
      lines.push(`  ${name.padEnd(12)} ${sign.padEnd(12)} ${deg}${house}${retro}`)
    }
    lines.push('')
  }

  // Houses
  const houses = data.houses ?? []
  if (Array.isArray(houses) && houses.length) {
    lines.push('── CASAS ──')
    for (const h of houses) {
      const num  = h.number ?? h.house ?? '?'
      const sign = h.sign ?? h.zodiac_sign ?? ''
      const deg  = h.position != null ? `${Number(h.position).toFixed(2)}°` : ''
      lines.push(`  Casa ${String(num).padEnd(3)} ${sign.padEnd(12)} ${deg}`)
    }
    lines.push('')
  }

  // Aspects
  const aspects = data.aspects ?? []
  if (Array.isArray(aspects) && aspects.length) {
    lines.push('── ASPECTOS ──')
    for (const a of aspects) {
      const p1   = a.p1_name ?? a.planet1 ?? '?'
      const p2   = a.p2_name ?? a.planet2 ?? '?'
      const type = a.aspect  ?? a.type    ?? '?'
      const orb  = a.orbit   != null ? ` (orbe ${Number(a.orbit).toFixed(2)}°)` : ''
      lines.push(`  ${p1} ${type} ${p2}${orb}`)
    }
    lines.push('')
  }

  // Fallback: raw JSON block
  if (lines.length <= 4) {
    lines.push('── DATOS CRUDOS ──')
    lines.push(JSON.stringify(data, null, 2))
  }

  return lines.join('\n')
}
