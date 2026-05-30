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
 */
export async function fetchNatalChart({ apiKey, name, date, time, place, houseSystem = 'P', zodiacType = 'Tropical' }) {
  if (!apiKey) throw new Error('Introduce tu API key de RapidAPI primero.')

  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute]     = (time || '12:00').split(':').map(Number)

  const { city, nation, latitude, longitude, timezone } = await geocode(place)

  const body = {
    subject: {
      name, year, month, day, hour, minute,
      city, nation, latitude, longitude, timezone,
      zodiac_type: zodiacType,
      houses_system_identifier: houseSystem,
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

// ─── Lookup tables ────────────────────────────────────────────────────────────

// Planet keys inside subject, in display order
const PLANET_KEYS = [
  'sun','moon','mercury','venus','mars',
  'jupiter','saturn','uranus','neptune','pluto',
  'chiron','mean_lilith','mean_north_lunar_node',
]

const PLANET_SYMBOL = {
  sun:'☉', moon:'☽', mercury:'☿', venus:'♀', mars:'♂',
  jupiter:'♃', saturn:'♄', uranus:'⛢', neptune:'♆', pluto:'♇',
  chiron:'⚷', mean_lilith:'⚸', mean_north_lunar_node:'☊',
}

const PLANET_ES = {
  sun:'Sol', moon:'Luna', mercury:'Mercurio', venus:'Venus', mars:'Marte',
  jupiter:'Júpiter', saturn:'Saturno', uranus:'Urano', neptune:'Neptuno', pluto:'Plutón',
  chiron:'Quirón', mean_lilith:'Lilith', mean_north_lunar_node:'Nodo Norte',
}

const SIGN_ES = {
  Ari:'Aries', Tau:'Tauro', Gem:'Géminis', Can:'Cáncer',
  Leo:'Leo',   Vir:'Virgo', Lib:'Libra',   Sco:'Escorpio',
  Sag:'Sagitario', Cap:'Capricornio', Aqu:'Acuario', Pis:'Piscis',
}

const SIGN_GLYPH = {
  Ari:'♈', Tau:'♉', Gem:'♊', Can:'♋', Leo:'♌', Vir:'♍',
  Lib:'♎', Sco:'♏', Sag:'♐', Cap:'♑', Aqu:'♒', Pis:'♓',
}

const HOUSE_KEYS = [
  'first_house','second_house','third_house','fourth_house',
  'fifth_house','sixth_house','seventh_house','eighth_house',
  'ninth_house','tenth_house','eleventh_house','twelfth_house',
]

// Convert "Sixth_House" → 6
function houseNum(str) {
  const map = {
    First:1,Second:2,Third:3,Fourth:4,Fifth:5,Sixth:6,
    Seventh:7,Eighth:8,Ninth:9,Tenth:10,Eleventh:11,Twelfth:12,
  }
  const word = str?.split('_')[0] ?? ''
  return map[word] ?? str
}

const ASPECT_ES = {
  conjunction: 'Conjunción ☌',
  opposition:  'Oposición ☍',
  trine:       'Trígono △',
  square:      'Cuadratura □',
  sextile:     'Sextil ⚹',
  quincunx:    'Quincuncio',
}

function formatDeg(deg) {
  const d  = Math.floor(deg)
  const mf = (deg - d) * 60
  const m  = Math.floor(mf)
  const s  = Math.round((mf - m) * 60)
  return `${d}°${String(m).padStart(2,'0')}'${String(s).padStart(2,'0')}"`
}

// ─── Formatter ────────────────────────────────────────────────────────────────

export function formatNatalChart(data, profileName) {
  if (!data || data.type === 'svg') return data?.content ?? ''

  const meta    = data.meta ?? {}
  const content = data.content ?? data
  const subj    = content.chart_data?.subject ?? content.subject ?? {}
  const aspects = content.chart_data?.aspects ?? []

  const lines = []
  const pad   = (s, n) => String(s).padEnd(n)

  // ── Header ──────────────────────────────────────────────────────────────────
  lines.push('✦ ─────────────── CARTA NATAL ─────────────── ✦')
  lines.push(`  ${(meta.name ?? profileName).toUpperCase()}`)
  if (meta.place) lines.push(`  ${meta.place}`)
  const dt = subj.iso_formatted_local_datetime
  if (dt) {
    const [datePart, timePart] = dt.split('T')
    const [y,m,d] = datePart.split('-')
    const meses = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre']
    lines.push(`  ${parseInt(d)} de ${meses[parseInt(m)-1]} de ${y}  ·  ${timePart.slice(0,5)}`)
  }
  if (subj.houses_system_name) lines.push(`  Sistema de casas: ${subj.houses_system_name}`)
  lines.push('')

  // ── Ascendente y Medio Cielo ────────────────────────────────────────────────
  const asc = subj.first_house
  const mc  = subj.tenth_house ?? subj.medium_coeli
  if (asc || mc) {
    lines.push('── ÁNGULOS ─────────────────────────────────────')
    if (asc) {
      const sign = SIGN_ES[asc.sign] ?? asc.sign
      const glyph = SIGN_GLYPH[asc.sign] ?? ''
      lines.push(`  ${pad('AC (Ascendente)', 20)} ${glyph} ${sign.padEnd(13)} ${formatDeg(asc.position)}`)
    }
    if (mc) {
      const sign = SIGN_ES[mc.sign] ?? mc.sign
      const glyph = SIGN_GLYPH[mc.sign] ?? ''
      lines.push(`  ${pad('MC (Medio Cielo)', 20)} ${glyph} ${sign.padEnd(13)} ${formatDeg(mc.position)}`)
    }
    lines.push('')
  }

  // ── Posiciones planetarias ──────────────────────────────────────────────────
  const planetRows = PLANET_KEYS.map(k => subj[k]).filter(Boolean)
  if (planetRows.length) {
    lines.push('── POSICIONES PLANETARIAS ──────────────────────')
    lines.push(`  ${'Planeta'.padEnd(15)} ${'Signo'.padEnd(15)} ${'Grado'.padEnd(12)} Casa   `)
    lines.push('  ' + '─'.repeat(56))
    for (const p of planetRows) {
      const key    = PLANET_KEYS.find(k => subj[k] === p)
      const symbol = PLANET_SYMBOL[key] ?? '·'
      const name   = PLANET_ES[key] ?? p.name ?? key
      const sign   = SIGN_ES[p.sign] ?? p.sign ?? '?'
      const glyph  = SIGN_GLYPH[p.sign] ?? ''
      const deg    = p.position != null ? formatDeg(p.position) : '—'
      const house  = p.house ? `Casa ${houseNum(p.house)}` : '—'
      const retro  = p.retrograde ? ' ℞' : ''
      lines.push(`  ${symbol} ${pad(name, 13)} ${glyph} ${pad(sign, 13)} ${pad(deg, 12)} ${house}${retro}`)
    }
    lines.push('')
  }

  // ── Casas ───────────────────────────────────────────────────────────────────
  const houseRows = HOUSE_KEYS.map((k,i) => subj[k] ? { num: i+1, ...subj[k] } : null).filter(Boolean)
  if (houseRows.length) {
    lines.push('── CÚSPIDES DE CASAS ───────────────────────────')
    for (const h of houseRows) {
      const sign  = SIGN_ES[h.sign] ?? h.sign ?? '?'
      const glyph = SIGN_GLYPH[h.sign] ?? ''
      const deg   = h.position != null ? formatDeg(h.position) : '—'
      lines.push(`  Casa ${String(h.num).padStart(2)}  ${glyph} ${pad(sign, 13)} ${deg}`)
    }
    lines.push('')
  }

  // ── Aspectos ────────────────────────────────────────────────────────────────
  if (aspects.length) {
    lines.push('── ASPECTOS PRINCIPALES ────────────────────────')
    // Translate planet names to Spanish
    const nameEs = (en) => {
      const key = Object.entries(PLANET_ES).find(([,v]) => v.toLowerCase() === en?.toLowerCase() || PLANET_ES[en?.toLowerCase()] === v)
      return PLANET_ES[en?.toLowerCase()] ?? en
    }
    for (const a of aspects) {
      const p1   = nameEs(a.p1_name)
      const p2   = nameEs(a.p2_name)
      const tipo = ASPECT_ES[a.aspect] ?? a.aspect
      const orb  = a.orbit != null ? ` (orbe ${Number(a.orbit).toFixed(1)}°)` : ''
      const mov  = a.aspect_movement === 'Applying' ? ' →' : ' ←'
      lines.push(`  ${pad(p1, 12)} — ${pad(p2, 12)}  ${tipo}${orb}${mov}`)
    }
    lines.push('')
  }

  lines.push('✦ ─────────────────────────────────────────── ✦')
  return lines.join('\n')
}
