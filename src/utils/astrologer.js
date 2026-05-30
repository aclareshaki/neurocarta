/**
 * Geocodes a place name to lat/lng/timezone using OpenStreetMap Nominatim (free, no key).
 */
async function geocode(place) {
  if (!place) return { city: '', nation: '', latitude: 51.5074, longitude: -0.1276, timezone: 'UTC' }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1&addressdetails=1`
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'es', 'User-Agent': 'NeuroCarta/1.0' },
    })
    if (!res.ok) throw new Error()
    const data = await res.json()
    if (!data.length) throw new Error()

    const { lat, lon, address } = data[0]
    const latitude  = parseFloat(lat)
    const longitude = parseFloat(lon)
    const city      = address?.city ?? address?.town ?? address?.village ?? place
    const nation    = address?.country_code?.toUpperCase() ?? ''

    // Resolve timezone from coordinates
    let timezone = 'UTC'
    try {
      const tzRes = await fetch(
        `https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lon}`
      )
      if (tzRes.ok) {
        const tz = await tzRes.json()
        timezone = tz.timeZone ?? 'UTC'
      }
    } catch { /* use UTC */ }

    return { city, nation, latitude, longitude, timezone }
  } catch {
    return { city: place, nation: '', latitude: 51.5074, longitude: -0.1276, timezone: 'UTC' }
  }
}

/**
 * Calls the Astrologer API v5 /chart/birth-chart endpoint.
 * Returns { type: 'svg', content: '<svg...>' } or { type: 'json', content: {...} }
 *
 * @param {object} params
 * @param {string} params.apiKey
 * @param {string} params.name
 * @param {string} params.date   "YYYY-MM-DD"
 * @param {string} params.time   "HH:MM"
 * @param {string} params.place
 */
export async function fetchNatalChart({ apiKey, name, date, time, place }) {
  if (!apiKey) throw new Error('Introduce tu API key de RapidAPI primero.')

  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute]     = (time || '12:00').split(':').map(Number)

  const { city, nation, latitude, longitude, timezone } = await geocode(place)

  const body = {
    subject: {
      name,
      year, month, day, hour, minute,
      city,
      nation,
      latitude,
      longitude,
      timezone,
      zodiac_type: 'Tropical',
      houses_system_identifier: 'P',
    },
    language: 'EN',
    theme: 'dark',
    split_chart: false,
    transparent_background: true,
    show_house_position_comparison: true,
    custom_title: `${name} — Carta Natal`,
    active_points: [
      'Sun','Moon','Mercury','Venus','Mars',
      'Jupiter','Saturn','Uranus','Neptune','Pluto',
      'Chiron','Lilith','north_node',
    ],
    active_aspects: [
      { name: 'conjunction', orb: 8 },
      { name: 'opposition',  orb: 8 },
      { name: 'trine',       orb: 8 },
      { name: 'square',      orb: 8 },
      { name: 'sextile',     orb: 6 },
    ],
  }

  const res = await fetch('https://astrologer.p.rapidapi.com/api/v5/chart/birth-chart', {
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

  const contentType = res.headers.get('content-type') ?? ''

  if (contentType.includes('svg') || contentType.includes('image')) {
    const svg = await res.text()
    return { type: 'svg', content: svg, meta: { name, place, city, latitude, longitude, timezone } }
  }

  const json = await res.json()
  return { type: 'json', content: json, meta: { name, place, city, latitude, longitude, timezone } }
}

// ─── Text formatter (used only when the API returns JSON, not SVG) ────────────

const PLANET_EMOJI = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '⛢', Neptune: '♆', Pluto: '♇',
  'True Node': '☊', 'Mean Node': '☊', north_node: '☊',
  Chiron: '⚷', Lilith: '⚸',
}

const SIGN_EMOJI = {
  Ari: '♈', Tau: '♉', Gem: '♊', Can: '♋', Leo: '♌', Vir: '♍',
  Lib: '♎', Sco: '♏', Sag: '♐', Cap: '♑', Aqu: '♒', Pis: '♓',
}

function signGlyph(sign = '') {
  return SIGN_EMOJI[sign.slice(0, 3)] ?? ''
}

function formatDeg(deg) {
  const d  = Math.floor(deg)
  const mf = (deg - d) * 60
  const m  = Math.floor(mf)
  const s  = Math.round((mf - m) * 60)
  return `${d}°${String(m).padStart(2,'0')}'${String(s).padStart(2,'0')}"`
}

export function formatNatalChart(data, profileName) {
  if (!data) return ''

  // If the API returned SVG, this function shouldn't be called — but guard anyway
  if (data.type === 'svg') return data.content

  const meta  = data.meta ?? {}
  const chart = data.content?.chart ?? data.content ?? data

  const lines = [
    `✦ ─────────────── CARTA NATAL ─────────────── ✦`,
    `  ${(meta.name ?? profileName).toUpperCase()}`,
    meta.place ? `  ${meta.place}` : '',
    meta.latitude != null
      ? `  ${Number(meta.latitude).toFixed(4)}° lat, ${Number(meta.longitude).toFixed(4)}° lon  ·  ${meta.timezone}`
      : '',
    '',
  ]

  const planets = chart.planets ?? chart.planets_degrees_ut ?? chart.bodies ?? []
  if (Array.isArray(planets) && planets.length) {
    lines.push('── PLANETAS Y PUNTOS ──────────────────────────')
    for (const p of planets) {
      const rawName = p.name ?? p.id ?? '?'
      const emoji   = PLANET_EMOJI[rawName] ?? '·'
      const name    = `${emoji} ${rawName}`.padEnd(18)
      const sign    = p.sign ?? p.zodiac_sign ?? ''
      const deg     = p.position != null ? formatDeg(p.position % 30)
                    : p.abs_pos  != null ? formatDeg(p.abs_pos  % 30) : ''
      const house   = p.house != null ? `  Casa ${p.house}` : ''
      const retro   = p.retrograde ? ' ℞' : ''
      lines.push(`  ${name} ${signGlyph(sign)} ${sign.padEnd(12)} ${deg}${house}${retro}`)
    }
    lines.push('')
  }

  const houses = chart.houses ?? chart.cusps ?? []
  if (Array.isArray(houses) && houses.length) {
    lines.push('── CÚSPIDES DE CASAS ──────────────────────────')
    for (const h of houses) {
      const num  = String(h.number ?? h.house ?? '?').padStart(2)
      const sign = h.sign ?? h.zodiac_sign ?? ''
      const deg  = h.position != null ? formatDeg(h.position) : ''
      lines.push(`  Casa ${num}  ${signGlyph(sign)} ${sign.padEnd(12)} ${deg}`)
    }
    lines.push('')
  }

  const aspects = chart.aspects ?? []
  if (Array.isArray(aspects) && aspects.length) {
    lines.push('── ASPECTOS ────────────────────────────────────')
    for (const a of aspects) {
      const p1  = a.p1_name ?? a.planet1 ?? a.body1 ?? '?'
      const p2  = a.p2_name ?? a.planet2 ?? a.body2 ?? '?'
      const typ = a.aspect  ?? a.type    ?? '?'
      const orb = a.orbit != null ? ` (orbe ${Number(a.orbit).toFixed(2)}°)` : ''
      lines.push(`  ${p1}  ${typ}  ${p2}${orb}`)
    }
    lines.push('')
  }

  if (lines.length <= 6) {
    lines.push('── DATOS CRUDOS ────────────────────────────────')
    lines.push(JSON.stringify(data.content ?? data, null, 2))
  }

  lines.push('✦ ─────────────────────────────────────────── ✦')
  return lines.join('\n')
}
