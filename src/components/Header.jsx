export default function Header({ onOpenSettings }) {
  return (
    <header className="bg-parchment-50 border-b border-parchment-300">
      <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-gold-500 text-lg select-none">✦</span>
          <div>
            <span className="font-serif text-lg font-semibold text-sepia-800 tracking-tight">
              NeuroCarta
            </span>
            <span className="hidden sm:inline text-[10px] font-sans uppercase tracking-widest text-sepia-400 ml-3">
              Cartas Natales
            </span>
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="btn-ghost text-xs px-3 py-1.5 border border-parchment-300"
          aria-label="API Key"
        >
          <span className="text-sepia-400">⚙</span>
          <span className="hidden sm:inline">API Key</span>
        </button>
      </div>
    </header>
  )
}
