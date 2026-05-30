import { useState } from 'react'

const HOUSE_LABELS = {
  P: 'Placidus', W: 'Casas Enteras', K: 'Koch', E: 'Equal', O: 'Porfiry',
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  const months = ['enero','febrero','marzo','abril','mayo','junio',
                  'julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${parseInt(d)} de ${months[parseInt(m)-1]} de ${y}`
}

function formatSavedDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

const SIGNS = [
  { sign: 'Capricornio', glyph: '♑', from:[12,22], to:[1,19] },
  { sign: 'Acuario',     glyph: '♒', from:[1,20],  to:[2,18] },
  { sign: 'Piscis',      glyph: '♓', from:[2,19],  to:[3,20] },
  { sign: 'Aries',       glyph: '♈', from:[3,21],  to:[4,19] },
  { sign: 'Tauro',       glyph: '♉', from:[4,20],  to:[5,20] },
  { sign: 'Géminis',     glyph: '♊', from:[5,21],  to:[6,20] },
  { sign: 'Cáncer',      glyph: '♋', from:[6,21],  to:[7,22] },
  { sign: 'Leo',         glyph: '♌', from:[7,23],  to:[8,22] },
  { sign: 'Virgo',       glyph: '♍', from:[8,23],  to:[9,22] },
  { sign: 'Libra',       glyph: '♎', from:[9,23],  to:[10,22] },
  { sign: 'Escorpio',    glyph: '♏', from:[10,23], to:[11,21] },
  { sign: 'Sagitario',   glyph: '♐', from:[11,22], to:[12,21] },
]

function sunSign(dateStr) {
  if (!dateStr) return null
  const [, m, d] = dateStr.split('-').map(Number)
  for (const s of SIGNS) {
    if (s.from[0] === 12) {
      if ((m === 12 && d >= s.from[1]) || (m === s.to[0] && d <= s.to[1])) return s
    } else {
      if ((m === s.from[0] && d >= s.from[1]) || (m === s.to[0] && d <= s.to[1])) return s
    }
  }
  return null
}

export default function ProfileCard({ profile, onEdit, onDelete, onChart, onInterpret }) {
  const [confirmDelete,      setConfirmDelete]      = useState(false)
  const [showChart,          setShowChart]          = useState(false)
  const [showInterpretation, setShowInterpretation] = useState(false)
  const sign = sunSign(profile.date)

  return (
    <article className="card fade-in-up">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <p className="section-title mb-1">Carta natal</p>
            <h3 className="font-serif text-2xl font-semibold text-sepia-800 leading-tight truncate">
              {profile.name}
            </h3>
            {sign && (
              <p className="text-sm text-sepia-400 font-sans mt-0.5">
                <span className="text-gold-500 mr-1">{sign.glyph}</span>
                {sign.sign} solar
              </p>
            )}
          </div>
          <div className="shrink-0 text-gold-400 text-3xl mt-1 select-none">✦</div>
        </div>

        {/* Data */}
        <div className="space-y-1.5 text-sm font-sans text-sepia-600 border-t border-parchment-200 pt-4">
          {profile.date && (
            <div className="flex gap-2">
              <span className="text-sepia-400 w-16 shrink-0 text-xs uppercase tracking-wider pt-px">Fecha</span>
              <span>
                {formatDate(profile.date)}
                {profile.time && <span className="text-sepia-400"> · {profile.time}</span>}
              </span>
            </div>
          )}
          {profile.place && (
            <div className="flex gap-2">
              <span className="text-sepia-400 w-16 shrink-0 text-xs uppercase tracking-wider pt-px">Lugar</span>
              <span>{profile.place}</span>
            </div>
          )}
          {(profile.houseSystem || profile.zodiacType) && (
            <div className="flex gap-2 flex-wrap pt-1">
              {profile.houseSystem && (
                <span className="text-[10px] font-sans uppercase tracking-wider text-sepia-400 border border-parchment-300 px-2 py-0.5">
                  {HOUSE_LABELS[profile.houseSystem] ?? profile.houseSystem}
                </span>
              )}
              {profile.zodiacType === 'Sidereal' && (
                <span className="text-[10px] font-sans uppercase tracking-wider text-sepia-400 border border-parchment-300 px-2 py-0.5">
                  Sidéreo
                </span>
              )}
            </div>
          )}
        </div>

        {/* Carta guardada */}
        {profile.savedChart && (
          <div className="mt-4 border-t border-parchment-200 pt-4">
            <button
              onClick={() => setShowChart(v => !v)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-gold-500 text-xs">✦</span>
                <span className="section-title">Carta natal guardada</span>
              </div>
              <div className="flex items-center gap-2">
                {profile.savedChartAt && (
                  <span className="text-[10px] text-sepia-300 font-sans hidden sm:inline">
                    {formatSavedDate(profile.savedChartAt)}
                  </span>
                )}
                <span className="text-sepia-400 text-xs" style={{ display:'inline-block', transform: showChart ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.2s' }}>
                  ▾
                </span>
              </div>
            </button>
            {showChart && (
              <pre className="mt-3 text-sepia-700 text-xs leading-relaxed font-sans whitespace-pre-wrap break-words bg-parchment-100 border border-parchment-200 p-3 max-h-64 overflow-y-auto">
                {profile.savedChart}
              </pre>
            )}
          </div>
        )}

        {/* Interpretación de Claude */}
        {profile.interpretation && (
          <div className="mt-4 border-t border-parchment-200 pt-4">
            <button
              onClick={() => setShowInterpretation(v => !v)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-gold-500 text-xs">✦</span>
                <span className="section-title">Interpretación de Claude</span>
              </div>
              <div className="flex items-center gap-2">
                {profile.interpretationAt && (
                  <span className="text-[10px] text-sepia-300 font-sans hidden sm:inline">
                    {formatSavedDate(profile.interpretationAt)}
                  </span>
                )}
                <span className="text-sepia-400 text-xs" style={{ display:'inline-block', transform: showInterpretation ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.2s' }}>
                  ▾
                </span>
              </div>
            </button>
            {showInterpretation && (
              <div className="mt-3 text-sepia-700 text-sm leading-relaxed font-sans whitespace-pre-wrap bg-parchment-100 border border-parchment-200 p-4 max-h-80 overflow-y-auto">
                {profile.interpretation}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-parchment-200 pt-4">
          <button onClick={() => onChart(profile)} className="btn-primary text-xs py-2 flex-1 sm:flex-none justify-center">
            <span className="text-gold-300">✦</span> Ver carta natal
          </button>
          <button
            onClick={() => onInterpret(profile)}
            className="btn-ghost text-xs py-2"
            title={profile.interpretation ? 'Editar interpretación' : 'Añadir interpretación de Claude'}
          >
            {profile.interpretation ? '✎ Interpretación' : '+ Interpretación'}
          </button>
          <button onClick={() => onEdit(profile)} className="btn-ghost text-xs py-2">
            Editar
          </button>
          {confirmDelete ? (
            <>
              <button onClick={() => onDelete(profile.id)} className="btn-danger text-xs py-2">
                Eliminar
              </button>
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost text-xs py-2">
                No
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="btn-ghost text-xs py-2 text-parchment-400 hover:text-terra-500"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
