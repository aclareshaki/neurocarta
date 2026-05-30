import { useState } from 'react'

const EMPTY = { name: '', date: '', time: '', place: '' }

export default function ProfileForm({ onSave, onClose, initial }) {
  const [form, setForm] = useState(initial ?? EMPTY)
  const [error, setError] = useState('')

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('El nombre es obligatorio.')
    if (!form.date)         return setError('La fecha de nacimiento es obligatoria.')
    setError('')
    onSave({ ...form, name: form.name.trim(), place: form.place.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-sepia-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative card w-full max-w-md fade-in-up shadow-xl shadow-sepia-900/10">
        <div className="h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
        <div className="p-6">
          <p className="section-title mb-1">{initial ? 'Editar ficha' : 'Nueva ficha'}</p>
          <h2 className="font-serif text-2xl font-semibold text-sepia-800 mb-6">
            {initial ? initial.name : 'Datos de nacimiento'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nombre</label>
              <input type="text" value={form.name} onChange={set('name')}
                     placeholder="Nombre completo" className="input-field" autoFocus />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Fecha de nacimiento</label>
                <input type="date" value={form.date} onChange={set('date')} className="input-field" />
              </div>
              <div>
                <label className="label">Hora (opcional)</label>
                <input type="time" value={form.time} onChange={set('time')} className="input-field" />
              </div>
            </div>

            <div>
              <label className="label">Lugar de nacimiento</label>
              <input type="text" value={form.place} onChange={set('place')}
                     placeholder="Ciudad, País" className="input-field" />
            </div>

            {error && <p className="text-terra-500 text-xs font-sans">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1 justify-center">
                {initial ? '✓ Guardar cambios' : '✦ Crear ficha'}
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
