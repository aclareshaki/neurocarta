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

  function openNew() {
    setEditTarget(null)
    setShowForm(true)
  }

  function openEdit(profile) {
    setEditTarget(profile)
    setShowForm(true)
  }

  function handleSaveProfile(data) {
    if (editTarget) {
      updateProfile(editTarget.id, data)
    } else {
      addProfile(data)
    }
  }

  function handleImport(data) {
    try {
      const n = importProfiles(data)
      setImportMsg(`${n} ficha${n !== 1 ? 's' : ''} importada${n !== 1 ? 's' : ''} correctamente.`)
      setTimeout(() => setImportMsg(''), 4000)
    } catch (err) {
      alert(err.message)
    }
  }

  function openChart(profile) {
    if (!apiKey) {
      setShowSettings(true)
    } else {
      setChartTarget(profile)
    }
  }

  return (
    <div className="min-h-screen stars">
      <Header onOpenSettings={() => setShowSettings(true)} />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Toolbar
          count={profiles.length}
          onNew={openNew}
          onExport={exportProfiles}
          onImport={handleImport}
        />

        {importMsg && (
          <div className="rounded-xl bg-cosmos-700/20 border border-cosmos-700/30 px-4 py-3 text-sm text-cosmos-200 fade-in-up">
            ✓ {importMsg}
          </div>
        )}

        {profiles.length === 0 ? (
          <EmptyState onNew={openNew} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {profiles.map(p => (
              <ProfileCard
                key={p.id}
                profile={p}
                onEdit={openEdit}
                onDelete={deleteProfile}
                onChart={openChart}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showForm && (
        <ProfileForm
          initial={editTarget}
          onSave={handleSaveProfile}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
        />
      )}

      {showSettings && (
        <ApiKeyModal
          apiKey={apiKey}
          onSave={saveApiKey}
          onClose={() => setShowSettings(false)}
        />
      )}

      {chartTarget && (
        <NatalChartModal
          profile={chartTarget}
          apiKey={apiKey}
          onClose={() => setChartTarget(null)}
        />
      )}
    </div>
  )
}

function EmptyState({ onNew }) {
  return (
    <div className="text-center py-20 fade-in-up">
      <div className="text-6xl mb-4 spin-slow inline-block">✦</div>
      <h2 className="text-xl font-semibold text-white mb-2">Sin fichas todavía</h2>
      <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
        Crea tu primera ficha de nacimiento para comenzar a calcular cartas natales.
      </p>
      <button onClick={onNew} className="btn-primary mx-auto">
        ✦ Crear primera ficha
      </button>
    </div>
  )
}
