import { useRef } from 'react'

export default function Toolbar({ count, onNew, onExport, onImport }) {
  const fileRef = useRef(null)

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result)
        onImport(data)
      } catch {
        alert('El archivo no es un JSON válido.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button onClick={onNew} className="btn-primary">
        <span>✦</span> Nueva ficha
      </button>

      <div className="flex gap-2 ml-auto">
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportFile}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="btn-ghost text-xs"
          title="Importar fichas desde JSON"
        >
          ↑ Importar
        </button>
        <button
          onClick={onExport}
          disabled={count === 0}
          className="btn-ghost text-xs"
          title="Exportar todas las fichas a JSON"
        >
          ↓ Exportar{count > 0 && ` (${count})`}
        </button>
      </div>
    </div>
  )
}
