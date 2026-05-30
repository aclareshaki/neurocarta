import { useState, useEffect } from 'react'
import { fetchNatalChart, formatNatalChart } from '../utils/astrologer'

const HOUSE_LABELS = {
  P: 'Placidus', W: 'Casas Enteras', K: 'Koch', E: 'Equal', O: 'Porfiry',
}

export default function NatalChartModal({ profile, apiKey, onClose }) {
  const [status, setStatus] = useState('loading')
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchNatalChart({
          apiKey,
          name:        profile.name,
          date:        profile.date,
          time:        profile.time || '12:00',
          place:       profile.place || '',
          houseSystem: profile.houseSystem || 'P',
          zodiacType:  profile.zodiacType  || 'Tropical',
        })
        if (cancelled) return
        setResult(data)
        setStatus('done')
      } catch (err) {
        if (cancelled) return
        setResult({ type: 'error', content: err.message })
        setStatus('error')
      }
    }
    load()
    return () => { cancelled = true }
  }, [profile, apiKey])

  function handleCopy() {
    const text = result?.type === 'svg'
      ? result.content
      : formatNatalChart(result, profile.name)

    // Try modern clipboard API first, fall back to execCommand for HTTP
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => copyViaTextarea(text))
    } else {
      copyViaTextarea(text)
    }
  }

  function copyViaTextarea(text) {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    try {
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* nothing */ }
    document.body.removeChild(ta)
  }

  function handleDownloadSvg() {
    const blob = new Blob([result.content], { type: 'image/svg+xml' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `carta-natal-${profile.name.replace(/\s+/g, '-').toLowerCase()}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-sepia-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative card w-full max-w-2xl max-h-[92vh] flex flex-col fade-in-up shadow-2xl shadow-sepia-900/15">
        <div className="h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent shrink-0" />

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-parchment-200 shrink-0">
          <div>
            <p className="section-title mb-1">C A R T A · N A T A L</p>
            <h2 className="font-serif text-2xl font-semibold text-sepia-800 leading-tight">
              {profile.name}
            </h2>
            {result?.meta && (
              <p className="text-xs text-sepia-400 font-sans mt-0.5">
                {result.meta.city || profile.place}
                {result.meta.timezone && result.meta.timezone !== 'UTC' && (
                  <span> · {result.meta.timezone}</span>
                )}
                {profile.houseSystem && (
                  <span> · {HOUSE_LABELS[profile.houseSystem] ?? profile.houseSystem}</span>
                )}
                {profile.zodiacType === 'Sidereal' && <span> · Sidéreo</span>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {status === 'done' && result?.type === 'svg' && (
              <button onClick={handleDownloadSvg} className="btn-ghost text-xs py-1.5 px-3">
                ↓ SVG
              </button>
            )}
            {status === 'done' && (
              <button onClick={handleCopy} className="btn-ghost text-xs py-1.5 px-3">
                {copied ? '✓ Copiado' : '⎘ Copiar'}
              </button>
            )}
            <button onClick={onClose} className="btn-ghost text-xl px-2 py-1 leading-none text-sepia-400">
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-5 py-16">
              <span className="text-5xl text-gold-400 spin-slow select-none">✦</span>
              <div className="text-center space-y-1">
                <p className="font-serif text-lg text-sepia-700">Calculando carta natal…</p>
                <p className="text-xs text-sepia-400 font-sans">Geocodificando ubicación y consultando API</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="p-6 space-y-4">
              <p className="font-serif text-lg text-terra-600">Error al obtener la carta natal</p>
              <pre className="text-terra-500 text-xs bg-terra-600/5 border border-terra-600/15 p-4 whitespace-pre-wrap break-words font-sans leading-relaxed">
                {result?.content}
              </pre>
              <p className="text-sepia-400 text-xs font-sans">
                Verifica que tu API key sea correcta y que tengas suscripción activa en RapidAPI.
              </p>
            </div>
          )}

          {status === 'done' && result?.type === 'svg' && (
            <div
              className="p-4 flex items-center justify-center [&_svg]:max-w-full [&_svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: result.content }}
            />
          )}

          {status === 'done' && result?.type === 'json' && (
            <pre className="p-6 text-sepia-700 text-sm leading-relaxed font-sans whitespace-pre-wrap break-words">
              {formatNatalChart(result, profile.name)}
            </pre>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent shrink-0" />
      </div>
    </div>
  )
}
