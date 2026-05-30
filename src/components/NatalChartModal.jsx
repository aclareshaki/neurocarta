import { useState, useEffect } from 'react'
import { fetchNatalChart, formatNatalChart } from '../utils/astrologer'

export default function NatalChartModal({ profile, apiKey, onClose }) {
  const [status, setStatus] = useState('loading') // loading | done | error
  const [text, setText]     = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchNatalChart({
          apiKey,
          name:  profile.name,
          date:  profile.date,
          time:  profile.time || '12:00',
          place: profile.place || '',
        })
        if (cancelled) return
        setText(formatNatalChart(data, profile.name))
        setStatus('done')
      } catch (err) {
        if (cancelled) return
        setText(err.message)
        setStatus('error')
      }
    }

    load()
    return () => { cancelled = true }
  }, [profile, apiKey])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-2xl max-h-[85vh] flex flex-col fade-in-up glow-purple">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">Carta Natal</h2>
            <p className="text-xs text-cosmos-400">{profile.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {status === 'done' && (
              <button onClick={handleCopy} className="btn-ghost text-xs px-3 py-1.5">
                {copied ? '✓ Copiado' : '⎘ Copiar'}
              </button>
            )}
            <button onClick={onClose} className="btn-ghost text-lg px-2 py-1 leading-none">×</button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-12">
              <span className="text-4xl spin-slow">✦</span>
              <p className="text-slate-400 text-sm">Calculando carta natal...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <p className="text-red-400 font-medium text-sm">Error al obtener la carta natal</p>
              <pre className="text-red-300 text-xs bg-red-500/10 rounded-xl p-4 whitespace-pre-wrap break-words">
                {text}
              </pre>
              <p className="text-slate-400 text-xs">
                Verifica que tu API key sea correcta y que tengas suscripción activa en RapidAPI.
              </p>
            </div>
          )}

          {status === 'done' && (
            <pre className="text-slate-200 text-xs leading-relaxed font-mono whitespace-pre-wrap break-words">
              {text}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
