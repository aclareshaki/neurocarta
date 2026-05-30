/**
 * Geocodes a place name to lat/lng using OpenStreetMap Nominatim (free, no key needed).
 */
async function geocode(place) {
  if (!place) return { latitude: 0, longitude: 0, timezone: 'UTC' }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'es', 'User-Agent': 'NeuroCarta/1.0' },
  })
  if (!res.ok) return { latitude: 0, longitude: 0, timezone: 'UTC' }

  const data = await res.json()
  if (!data.length) return { latitude: 0, longitude: 0, timezone: 'UTC' }

  const { lat, lon } = data[0]

  // Resolve timezone from coordinates using timeapi.io (free)
  try {
    const tzRes = await fetch(
      `https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lon}`
    )
    if (tzRes.ok) {
      const tzData = await tzRes.json()
      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        timezone: tzData.timeZone ?? 'UTC',
      }
    }
  } catch {
    // fall through
  }

  return { latitude: parseFloat(lat), longitude: parseFloat(lon), timezone: 'UTC' }
}

/**
 * Calls the Astrologer API v5 on RapidAPI to fetch a natal (birth) chart.
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

  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute]     = (time || '12:00').split(':').map(Number)

  // Step 1: geocode
  const { latitude, longitude, timezone } = await geocode(place)

  // Step 2: call Astrologer API v5
  const body = {
    year, month, day, hour, minute,
    latitude,
    longitude,
    timezone,
    location_precision: 4,
  }

  const res = await fetch('https://astrologer.p.rapidapi.com/api/v5/birth-chart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'astrologer.p.rapidapi.com',
      'x-rapidapi-key': apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error ${res.status}: ${text}`)
  }

  const json = await res.json()
  return { ...json, _meta: { name, place, latitude, longitude, timezone } }
}

// ─── Formatter ────────────────────────────────────────────────────────────────

const PLANET_EMOJI = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '⛢', Neptune: '♆', Pluto: '♇',
  'True Node': '☊', 'Mean Node': '☊', Chiron: '⚷', Lilith: '⚸',
}

const SIGN_EMOJI = {
  Ari: '♈', Tau: '♉', Gem: '♊', Can: '♋', Leo: '♌', Vir: '♍',
  Lib: '♎', Sco: '♏', Sag: '♐', Cap: '♑', Aqu: '♒', Pis: '♓',
}

function signGlyph(sign = '') {
  const key = sign.slice(0, 3)
  return SIGN_EMOJI[key] ?? ''
}

/**
 * Formats the raw v5 natal chart JSON into human-readable text.
 */
export function formatNatalChart(data, profileName) {
  if (!data) return ''

  const meta  = data._meta ?? {}
  const chart = data.chart ?? data

  const lines = [
    `✦ ─────────────── CARTA NATAL ─────────────── ✦`,
    `  ${(meta.name ?? profileName).toUpperCase()}`,
    meta.place ? `  ${meta.place}` : '',
    meta.latitude != null
      ? `  ${meta.latitude.toFixed(4)}° lat, ${meta.longitude.toFixed(4)}° lon  ·  ${meta.timezone}`
      : '',
    '',
  ].filter(l => l !== undefined)

  // ── Planets / points ──
  const planets = chart.planets ?? chart.planets_degrees_ut ?? chart.bodies ?? []
  if (Array.isArray(planets) && planets.length) {
    lines.push('── PLANETAS Y PUNTOS ──────────────────────────')
    for (const p of planets) {
      const rawName = p.name ?? p.id ?? '?'
      const emoji   = PLANET_EMOJI[rawName] ?? '·'
      const name    = `${emoji} ${rawName}`.padEnd(18)
      const sign    = p.sign ?? p.zodiac_sign ?? ''
      const glyph   = signGlyph(sign)
      const deg     = p.position != null
        ? formatDeg(p.position)
        : p.abs_pos != null ? formatDeg(p.abs_pos % 30) : ''
      const house   = p.house != null ? `  Casa ${p.house}` : ''
      const retro   = p.retrograde ? ' ℞' : ''
      lines.push(`  ${name} ${glyph} ${sign.padEnd(12)} ${deg}${house}${retro}`)
    }
    lines.push('')
  }

  // ── Houses ──
  const houses = chart.houses ?? chart.cusps ?? []
  if (Array.isArray(houses) && houses.length) {
    lines.push('── CÚSPIDES DE CASAS ──────────────────────────')
    for (const h of houses) {
      const num   = String(h.number ?? h.house ?? '?').padStart(2)
      const sign  = h.sign ?? h.zodiac_sign ?? ''
      const glyph = signGlyph(sign)
      const deg   = h.position != null ? formatDeg(h.position) : ''
      lines.push(`  Casa ${num}  ${glyph} ${sign.padEnd(12)} ${deg}`)
    }
    lines.push('')
  }

  // ── Aspects ──
  const aspects = chart.aspects ?? []
  if (Array.isArray(aspects) && aspects.length) {
    lines.push('── ASPECTOS ────────────────────────────────────')
    for (const a of aspects) {
      const p1   = a.p1_name ?? a.planet1 ?? a.body1 ?? '?'
      const p2   = a.p2_name ?? a.planet2 ?? a.body2 ?? '?'
      const type = a.aspect  ?? a.type    ?? '?'
      const orb  = a.orbit   != null ? ` (orbe ${Number(a.orbit).toFixed(2)}°)` : ''
      lines.push(`  ${p1}  ${type}  ${p2}${orb}`)
    }
    lines.push('')
  }

  // ── Fallback: raw JSON if nothing matched ──
  if (lines.length <= 6) {
    lines.push('── DATOS CRUDOS ────────────────────────────────')
    lines.push(JSON.stringify(data, null, 2))
  }

  lines.push('✦ ─────────────────────────────────────────── ✦')
  return lines.join('\n')
}

function formatDeg(deg) {
  const d = Math.floor(deg)
  const mf = (deg - d) * 60
  const m  = Math.floor(mf)
  const s  = Math.round((mf - m) * 60)
  return `${d}°${String(m).padStart(2,'0')}'${String(s).padStart(2,'0')}"`
}
