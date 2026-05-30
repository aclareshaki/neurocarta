import { useState } from 'react'
import { useProfiles }  from './hooks/useProfiles'
import { useApiKey }    from './hooks/useApiKey'
import Header           from './components/Header'
import Toolbar          from './components/Toolbar'
import ProfileCard      from './components/ProfileCard'
import ProfileForm      from './components/ProfileForm'
import ApiKeyModal      from './components/ApiKeyModal'
import NatalChartModal  from './components/NatalChartModal'

export default function App() {
  const { profiles, addProfile, updateProfile, deleteProfile, importProfiles, exportProfiles } = useProfiles()
  const { apiKey, saveApiKey } = useApiKey()

  const [showForm,     setShowForm]     = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [chartTarget,  setChartTarget]  = useState(null)
  const [importMsg,    setImportMsg]    = useState('')

  function openNew()            { setEditTarget(null); setShowForm(true) }
  function openEdit(p)          { setEditTarget(p); setShowForm(true) }

  function handleSave(data) {
    editTarget ? updateProfile(editTarget.id, data) : addProfile(data)
  }

  function handleImport(data) {
    try {
      const n = importProfiles(data)
      setImportMsg(`${n} ficha${n !== 1 ? 's' : ''} importada${n !== 1 ? 's' : ''}.`)
      setTimeout(() => setImportMsg(''), 4000)
    } catch (err) { alert(err.message) }
  }

  function openChart(profile) {
    if (!apiKey) { setShowSettings(true) } else { setChartTarget(profile) }
  }

  return (
    <div className="min-h-screen bg-parchment-100">
      <Header onOpenSettings={() => setShowSettings(true)} />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Toolbar count={profiles.length} onNew={openNew} onExport={exportProfiles} onImport={handleImport} />

        {importMsg && (
          <div className="bg-parchment-50 border border-parchment-300 px-4 py-3 text-sm text-sepia-600 font-sans fade-in-up flex items-center gap-2">
            <span className="text-gold-500">✦</span> {importMsg}
          </div>
        )}

        {profiles.length === 0 ? (
          <EmptyState onNew={openNew} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {profiles.map(p => (
              <ProfileCard key={p.id} profile={p} onEdit={openEdit} onDelete={deleteProfile} onChart={openChart} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-parchment-300 mt-16 py-6">
        <p className="text-center text-[10px] font-sans uppercase tracking-widest text-parchment-400">
          ✦ · N E U R O C A R T A · ✦
        </p>
      </footer>

      {showForm    && <ProfileForm initial={editTarget} onSave={handleSave} onClose={() => { setShowForm(false); setEditTarget(null) }} />}
      {showSettings && <ApiKeyModal apiKey={apiKey} onSave={saveApiKey} onClose={() => setShowSettings(false)} />}
      {chartTarget  && <NatalChartModal profile={chartTarget} apiKey={apiKey} onClose={() => setChartTarget(null)} />}
    </div>
  )
}

function EmptyState({ onNew }) {
  return (
    <div className="text-center py-20 fade-in-up">
      <div className="text-5xl text-gold-400 mb-5 spin-slow inline-block select-none">✦</div>
      <p className="section-title mb-3">Bienvenido a NeuroCarta</p>
      <h2 className="font-serif text-2xl font-semibold text-sepia-700 mb-3">
        Sin fichas todavía
      </h2>
      <p className="text-sepia-400 text-sm font-sans mb-8 max-w-xs mx-auto leading-relaxed">
        Crea tu primera ficha de nacimiento para comenzar a calcular cartas natales.
      </p>
      <button onClick={onNew} className="btn-primary mx-auto">
        <span className="text-gold-300">✦</span> Crear primera ficha
      </button>
    </div>
  )
}
