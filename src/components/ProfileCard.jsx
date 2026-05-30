import { useState } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

const SIGNS = [
  { sign: 'Capricornio', from: [12,22], to: [1,19] },
  { sign: 'Acuario',     from: [1,20],  to: [2,18] },
  { sign: 'Piscis',      from: [2,19],  to: [3,20] },
  { sign: 'Aries',       from: [3,21],  to: [4,19] },
  { sign: 'Tauro',       from: [4,20],  to: [5,20] },
  { sign: 'Géminis',     from: [5,21],  to: [6,20] },
  { sign: 'Cáncer',      from: [6,21],  to: [7,22] },
  { sign: 'Leo',         from: [7,23],  to: [8,22] },
  { sign: 'Virgo',       from: [8,23],  to: [9,22] },
  { sign: 'Libra',       from: [9,23],  to: [10,22] },
  { sign: 'Escorpio',    from: [10,23], to: [11,21] },
  { sign: 'Sagitario',   from: [11,22], to: [12,21] },
]

const GLYPHS = {
  Aries: '♈', Tauro: '♉', Géminis: '♊', Cáncer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Escorpio: '♏', Sagitario: '♐', Capricornio: '♑', Acuario: '♒', Piscis: '♓',
}

function sunSign(dateStr) {
  if (!dateStr) return null
  const [, m, d] = dateStr.split('-').map(Number)
  for (const { sign, from, to } of SIGNS) {
    if (from[0] === 12) {
      if ((m === 12 && d >= from[1]) || (m === to[0] && d <= to[1])) return sign
    } else {
      if ((m === from[0] && d >= from[1]) || (m === to[0] && d <= to[1])) return sign
    }
  }
  return null
}

export default function ProfileCard({ profile, onEdit, onDelete, onChart }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const sign = sunSign(profile.date)
  const glyph = sign ? GLYPHS[sign] : '✦'

  return (
    <article className="card p-5 fade-in-up hover:border-cosmos-700/40 transition-colors duration-300">
      <div className="flex items-start gap-4">
        {/* Avatar glyph */}
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-cosmos-800/50 border border-cosmos-700/30 flex items-center justify-center text-2xl">
          {glyph}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate leading-tight">{profile.name}</h3>
          {sign && <p className="text-xs text-cosmos-400 mb-2">{sign} solar</p>}

          <div className="space-y-0.5 text-xs text-slate-400">
            <p>
              <span className="text-slate-500">Nacimiento</span>{' '}
              {formatDate(profile.date)}
              {profile.time && <span className="text-slate-500"> · {profile.time}</span>}
            </p>
            {profile.place && (
              <p>
                <span className="text-slate-500">Lugar</span>{' '}
                {profile.place}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => onChart(profile)}
          className="btn-primary text-xs py-1.5 px-3 flex-1 sm:flex-none justify-center"
        >
          ✦ Carta natal
        </button>
        <button onClick={() => onEdit(profile)} className="btn-ghost text-xs py-1.5 px-3">
          ✎ Editar
        </button>
        {confirmDelete ? (
          <>
            <button onClick={() => onDelete(profile.id)} className="btn-danger text-xs py-1.5 px-3">
              ¿Eliminar?
            </button>
            <button onClick={() => setConfirmDelete(false)} className="btn-ghost text-xs py-1.5 px-2">
              No
            </button>
          </>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="btn-ghost text-xs py-1.5 px-3 text-slate-500 hover:text-red-400">
            ✕
          </button>
        )}
      </div>
    </article>
  )
}
