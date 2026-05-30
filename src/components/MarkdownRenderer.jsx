/**
 * Lightweight Markdown renderer — handles the subset Claude typically produces:
 * ## headers, **bold**, *italic*, - lists, > blockquotes, --- dividers, paragraphs.
 */
export default function MarkdownRenderer({ text, className = '' }) {
  if (!text) return null

  const lines = text.split('\n')
  const elements = []
  let i = 0
  let key = 0

  function inlineFormat(str) {
    // **bold**, *italic*, `code`
    const parts = []
    const rx = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
    let last = 0, m
    while ((m = rx.exec(str)) !== null) {
      if (m.index > last) parts.push(str.slice(last, m.index))
      if (m[2]) parts.push(<strong key={key++} className="font-semibold text-sepia-800">{m[2]}</strong>)
      else if (m[3]) parts.push(<em key={key++} className="italic text-sepia-600">{m[3]}</em>)
      else if (m[4]) parts.push(<code key={key++} className="font-mono text-xs bg-parchment-200 px-1 py-0.5">{m[4]}</code>)
      last = m.index + m[0].length
    }
    if (last < str.length) parts.push(str.slice(last))
    return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
  }

  while (i < lines.length) {
    const line = lines[i]

    // Blank line
    if (line.trim() === '') { i++; continue }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(
        <div key={key++} className="my-4 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
      )
      i++; continue
    }

    // H1
    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={key++} className="font-serif text-xl font-semibold text-sepia-800 mt-6 mb-2 leading-tight">
          {inlineFormat(line.slice(2))}
        </h2>
      )
      i++; continue
    }

    // H2
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={key++} className="font-serif text-lg font-semibold text-sepia-700 mt-5 mb-1.5 leading-tight border-b border-parchment-200 pb-1">
          {inlineFormat(line.slice(3))}
        </h3>
      )
      i++; continue
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={key++} className="font-sans text-sm font-semibold text-sepia-600 uppercase tracking-wider mt-4 mb-1">
          {inlineFormat(line.slice(4))}
        </h4>
      )
      i++; continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={key++} className="border-l-2 border-gold-400 pl-4 my-3 text-sepia-500 italic font-sans text-sm">
          {inlineFormat(line.slice(2))}
        </blockquote>
      )
      i++; continue
    }

    // List — collect consecutive list items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(
          <li key={key++} className="flex gap-2 text-sepia-700 text-sm leading-relaxed">
            <span className="text-gold-500 mt-0.5 shrink-0">·</span>
            <span>{inlineFormat(lines[i].slice(2))}</span>
          </li>
        )
        i++
      }
      elements.push(
        <ul key={key++} className="my-2 space-y-1 font-sans">
          {items}
        </ul>
      )
      continue
    }

    // Normal paragraph
    elements.push(
      <p key={key++} className="text-sepia-700 text-sm leading-relaxed font-sans my-2">
        {inlineFormat(line)}
      </p>
    )
    i++
  }

  return (
    <div className={`prose-neurocarta ${className}`}>
      {elements}
    </div>
  )
}
