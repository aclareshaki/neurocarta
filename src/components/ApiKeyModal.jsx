import { useState } from 'react'

export default function ApiKeyModal({ apiKey, onSave, onClose }) {
  const [value, setValue] = useState(apiKey)
  const [show, setShow]   = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    onSave(value.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-sepia-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative card w-full max-w-md fade-in-up shadow-xl shadow-sepia-900/10">
        <div className="h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
        <div className="p-6">
          <p className="section-title mb-1">Configuración</p>
          <h2 className="font-serif text-2xl font-semibold text-sepia-800 mb-2">API Key</h2>
          <p className="text-sm text-sepia-400 font-sans mb-6 leading-relaxed">
            Tu clave de RapidAPI se guarda únicamente en este dispositivo.
            Obtenla en{' '}
            <span className="text-gold-600">astrologer.p.rapidapi.com</span>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">RapidAPI Key</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="Pega tu clave aquí…"
                  className="input-field pr-16"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sepia-400 hover:text-sepia-600 text-xs font-sans transition-colors"
                >
                  {show ? 'ocultar' : 'ver'}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1 justify-center">
                ✓ Guardar
              </button>
              <button type="button" onClick={onClose} className="btn-ghost">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
