import { useRef } from 'react'

export default function Toolbar({ count, onNew, onExport, onImport }) {
  const fileRef = useRef(null)

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => {
      try {
        onImport(JSON.parse(evt.target.result))
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
        <span className="text-gold-300">✦</span> Nueva ficha
      </button>
      <div className="flex gap-2 ml-auto">
        <input ref={fileRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="btn-ghost text-xs">
          ↑ Importar
        </button>
        <button onClick={onExport} disabled={count === 0} className="btn-ghost text-xs">
          ↓ Exportar{count > 0 && ` (${count})`}
        </button>
      </div>
    </div>
  )
}
