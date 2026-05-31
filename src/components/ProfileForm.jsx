import { useState } from 'react'

const EMPTY = { name: '', date: '', time: '', place: '', houseSystem: 'P', zodiacType: 'Tropical' }

const HOUSE_SYSTEMS = [
  { value: 'P', label: 'Placidus',       desc: 'El más usado en astrología occidental moderna' },
  { value: 'W', label: 'Casas Enteras',  desc: 'Astrología helenística y moderna alternativa' },
  { value: 'K', label: 'Koch',           desc: 'Popular en Europa central' },
  { value: 'E', label: 'Equal (Igual)',  desc: 'Casas de 30° desde el Ascendente' },
  { value: 'O', label: 'Porfiry',        desc: 'Astrología clásica' },
]

const ZODIAC_TYPES = [
  { value: 'Tropical',  label: 'Tropical',  desc: 'Astrología occidental (estaciones solares)' },
  { value: 'Sidereal',  label: 'Sidéreo',   desc: 'Astrología védica / Jyotish (posición real)' },
]

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
      <div className="relative card w-full max-w-md fade-in-up shadow-xl shadow-sepia-900/10 max-h-[90vh] overflow-y-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
        <div className="p-6">
          <p className="section-title mb-1">{initial ? 'Editar ficha' : 'Nueva ficha'}</p>
          <h2 className="font-serif text-2xl font-semibold text-sepia-800 mb-6">
            {initial ? initial.name : 'Datos de nacimiento'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nombre */}
            <div>
              <label className="label">Nombre</label>
              <input type="text" value={form.name} onChange={set('name')}
                     placeholder="Nombre completo" className="input-field" autoFocus />
            </div>

            {/* Fecha y hora */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Fecha de nacimiento</label>
                <input type="date" value={form.date} onChange={set('date')} className="input-field" />
              </div>
              <div>
                <label className="label">Hora (obligatoria)</label>
                <input type="time" value={form.time} onChange={set('time')} className="input-field" />
              </div>
            </div>

            {/* Lugar */}
            <div>
              <label className="label">Lugar de nacimiento</label>
              <input type="text" value={form.place} onChange={set('place')}
                     placeholder="Ciudad, País" className="input-field" />
            </div>

            {/* Separador */}
            <div className="border-t border-parchment-200 pt-4">
              <p className="section-title mb-3">Configuración astrológica</p>

              {/* Sistema de casas */}
              <div className="mb-4">
                <label className="label">Sistema de casas</label>
                <select value={form.houseSystem} onChange={set('houseSystem')} className="input-field">
                  {HOUSE_SYSTEMS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <p className="text-xs text-sepia-400 mt-1.5 font-sans">
                  {HOUSE_SYSTEMS.find(s => s.value === form.houseSystem)?.desc}
                </p>
              </div>

              {/* Tipo de zodíaco */}
              <div>
                <label className="label">Tipo de zodíaco</label>
                <div className="grid grid-cols-2 gap-2">
                  {ZODIAC_TYPES.map(z => (
                    <button
                      key={z.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, zodiacType: z.value }))}
                      className={`p-3 text-left border transition-all duration-150 ${
                        form.zodiacType === z.value
                          ? 'border-gold-500 bg-gold-500/8 text-sepia-800'
                          : 'border-parchment-300 bg-white text-sepia-500 hover:border-parchment-400'
                      }`}
                    >
                      <div className="text-sm font-medium font-sans">{z.label}</div>
                      <div className="text-[10px] text-sepia-400 mt-0.5 leading-tight">{z.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
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
