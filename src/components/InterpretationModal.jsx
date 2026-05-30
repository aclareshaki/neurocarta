import { useState } from 'react'

export default function InterpretationModal({ profile, onSave, onClose }) {
  const [text, setText] = useState(profile.interpretation ?? '')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave(text.trim())
    setSaved(true)
    setTimeout(() => onClose(), 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-sepia-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative card w-full max-w-2xl fade-in-up shadow-xl shadow-sepia-900/10 flex flex-col max-h-[90vh]">
        <div className="h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent shrink-0" />

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-parchment-200 shrink-0">
          <div>
            <p className="section-title mb-1">I N T E R P R E T A C I Ó N</p>
            <h2 className="font-serif text-2xl font-semibold text-sepia-800 leading-tight">
              {profile.name}
            </h2>
            <p className="text-xs text-sepia-400 font-sans mt-0.5">
              Pega aquí la interpretación de Claude
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost text-xl px-2 py-1 leading-none text-sepia-400 mt-1">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-xs text-sepia-400 font-sans leading-relaxed bg-parchment-100 border border-parchment-200 px-3 py-2.5">
            <span className="text-gold-500">✦</span> Copia la carta natal desde la ficha, pégala en Claude y pídele una lectura. Cuando tengas la respuesta, pégala aquí para guardarla.
          </p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Pega aquí la interpretación de Claude…"
            className="input-field w-full h-64 resize-none font-sans text-sm leading-relaxed"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-parchment-200 flex gap-3 shrink-0">
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saved ? '✓ Guardado' : '✦ Guardar interpretación'}
          </button>
          <button onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent shrink-0" />
      </div>
    </div>
  )
}
