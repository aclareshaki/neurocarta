export default function Header({ onOpenSettings }) {
  return (
    <header className="sticky top-0 z-40 bg-mystic-900/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl spin-slow select-none">✦</span>
          <div>
            <h1 className="text-base font-semibold text-white leading-none">NeuroCarta</h1>
            <p className="text-[10px] text-cosmos-400 tracking-widest uppercase">Cartas Natales</p>
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="btn-ghost text-xs px-3 py-1.5"
          aria-label="Configuración de API"
        >
          <span className="text-base">⚙</span>
          <span className="hidden sm:inline">API Key</span>
        </button>
      </div>
    </header>
  )
}
