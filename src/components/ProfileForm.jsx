import { useState } from 'react'

const EMPTY = { name: '', date: '', time: '', place: '' }

export default function ProfileForm({ onSave, onClose, initial }) {
  const [form, setForm] = useState(initial ?? EMPTY)
  const [error, setError] = useState('')

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card p-6 w-full max-w-md fade-in-up glow-purple">
        <h2 className="text-lg font-semibold text-white mb-5">
          {initial ? 'Editar ficha' : 'Nueva ficha'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Nombre completo"
              className="input-field"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Fecha de nacimiento</label>
              <input
                type="date"
                value={form.date}
                onChange={set('date')}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Hora (opcional)</label>
              <input
                type="time"
                value={form.time}
                onChange={set('time')}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">Lugar de nacimiento</label>
            <input
              type="text"
              value={form.place}
              onChange={set('place')}
              placeholder="Ciudad, País"
              className="input-field"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary flex-1">
              {initial ? '✓ Guardar cambios' : '✦ Crear ficha'}
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
