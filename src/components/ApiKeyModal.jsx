import { useState } from 'react'

export default function ApiKeyModal({ apiKey, onSave, onClose }) {
  const [value, setValue] = useState(apiKey)
  const [show, setShow] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    onSave(value.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card p-6 w-full max-w-md fade-in-up glow-purple">
        <h2 className="text-lg font-semibold text-white mb-1">Configuración de API</h2>
        <p className="text-xs text-slate-400 mb-5">
          Tu API key de RapidAPI se guarda solo en tu dispositivo (localStorage).
          Obténla en <span className="text-cosmos-400">astrologer.p.rapidapi.com</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">RapidAPI Key</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Pega tu API key aquí..."
                className="input-field pr-20"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs transition-colors"
              >
                {show ? 'ocultar' : 'ver'}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary flex-1">
              ✓ Guardar
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
