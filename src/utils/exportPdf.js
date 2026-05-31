/**
 * Opens a styled print window with the natal chart and/or interpretation,
 * matching the NeuroCarta parchment aesthetic. The user can print or save as PDF.
 */

function markdownToHtml(text) {
  if (!text) return ''
  const lines = text.split('\n')
  const out = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') { i++; continue }

    if (/^---+$/.test(line.trim())) {
      out.push('<hr>')
      i++; continue
    }

    if (line.startsWith('# '))  { out.push(`<h2>${inline(line.slice(2))}</h2>`);  i++; continue }
    if (line.startsWith('## ')) { out.push(`<h3>${inline(line.slice(3))}</h3>`);  i++; continue }
    if (line.startsWith('### ')){ out.push(`<h4>${inline(line.slice(4))}</h4>`);  i++; continue }
    if (line.startsWith('> '))  { out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`); i++; continue }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(`<li>${inline(lines[i].slice(2))}</li>`)
        i++
      }
      out.push(`<ul>${items.join('')}</ul>`)
      continue
    }

    out.push(`<p>${inline(line)}</p>`)
    i++
  }

  return out.join('\n')
}

function inline(str) {
  return str
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/`(.+?)`/g,       '<code>$1</code>')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const months = ['enero','febrero','marzo','abril','mayo','junio',
                  'julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${parseInt(d)} de ${months[parseInt(m)-1]} de ${y}`
}

export function exportProfilePdf(profile) {
  const hasChart          = !!profile.savedChart
  const hasInterpretation = !!profile.interpretation

  if (!hasChart && !hasInterpretation) return

  const dateStr  = formatDate(profile.date)
  const timeStr  = profile.time  ? ` · ${profile.time}` : ''
  const placeStr = profile.place ? profile.place : ''

  const chartHtml = hasChart
    ? `<section class="chart-section">
        <div class="section-label">C A R T A · N A T A L</div>
        <pre class="chart-pre">${profile.savedChart}</pre>
       </section>`
    : ''

  const interpretHtml = hasInterpretation
    ? `<section class="interp-section">
        <div class="section-label">I N T E R P R E T A C I Ó N</div>
        <div class="interp-body">${markdownToHtml(profile.interpretation)}</div>
       </section>`
    : ''

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Carta Natal · ${profile.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --parchment-50:  #fdf8f0;
      --parchment-100: #f9f0e0;
      --parchment-200: #eedfc4;
      --parchment-300: #dfc9a3;
      --sepia-400:     #9c7b5a;
      --sepia-600:     #6b4f35;
      --sepia-700:     #5a3e28;
      --sepia-800:     #3d2b1a;
      --gold-400:      #c9a84c;
      --gold-500:      #b8973a;
    }

    @page {
      size: A4;
      margin: 20mm 18mm;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--parchment-50);
      color: var(--sepia-700);
      line-height: 1.6;
      font-size: 11pt;
    }

    /* ── Cover / Header ── */
    .cover {
      text-align: center;
      padding: 32px 0 24px;
      border-bottom: 1px solid var(--parchment-300);
      margin-bottom: 28px;
    }

    .cover-ornament {
      font-size: 28px;
      color: var(--gold-400);
      letter-spacing: 0.3em;
      display: block;
      margin-bottom: 8px;
    }

    .cover-label {
      font-family: 'Inter', sans-serif;
      font-size: 7pt;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--sepia-400);
      margin-bottom: 10px;
    }

    .cover-name {
      font-family: 'EB Garamond', serif;
      font-size: 30pt;
      font-weight: 600;
      color: var(--sepia-800);
      line-height: 1.2;
      margin-bottom: 8px;
    }

    .cover-meta {
      font-family: 'Inter', sans-serif;
      font-size: 9pt;
      color: var(--sepia-400);
    }

    .cover-rule {
      height: 1px;
      background: linear-gradient(to right, transparent, var(--gold-400), transparent);
      margin: 16px auto 0;
      width: 60%;
      border: none;
    }

    /* ── Sections ── */
    .section-label {
      font-family: 'Inter', sans-serif;
      font-size: 6.5pt;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--sepia-400);
      margin-bottom: 12px;
    }

    .chart-section {
      margin-bottom: 32px;
    }

    .chart-pre {
      font-family: 'Inter', sans-serif;
      font-size: 8.5pt;
      line-height: 1.7;
      white-space: pre-wrap;
      word-break: break-word;
      color: var(--sepia-700);
      background: var(--parchment-100);
      border: 1px solid var(--parchment-200);
      padding: 16px 18px;
    }

    .interp-section {
      margin-bottom: 32px;
      page-break-before: auto;
    }

    .interp-body {
      font-family: 'Inter', sans-serif;
      font-size: 10pt;
      color: var(--sepia-700);
    }

    /* ── Markdown rendering ── */
    .interp-body h2 {
      font-family: 'EB Garamond', serif;
      font-size: 16pt;
      font-weight: 600;
      color: var(--sepia-800);
      margin-top: 24px;
      margin-bottom: 6px;
      line-height: 1.3;
    }

    .interp-body h3 {
      font-family: 'EB Garamond', serif;
      font-size: 13pt;
      font-weight: 600;
      color: var(--sepia-700);
      margin-top: 18px;
      margin-bottom: 4px;
      padding-bottom: 3px;
      border-bottom: 1px solid var(--parchment-200);
    }

    .interp-body h4 {
      font-family: 'Inter', sans-serif;
      font-size: 7.5pt;
      font-weight: 500;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--sepia-400);
      margin-top: 14px;
      margin-bottom: 4px;
    }

    .interp-body p {
      margin-bottom: 8px;
      line-height: 1.7;
    }

    .interp-body ul {
      list-style: none;
      margin: 8px 0;
      padding: 0;
    }

    .interp-body ul li {
      padding-left: 14px;
      position: relative;
      margin-bottom: 4px;
      line-height: 1.6;
    }

    .interp-body ul li::before {
      content: '·';
      color: var(--gold-500);
      position: absolute;
      left: 0;
    }

    .interp-body strong { font-weight: 600; color: var(--sepia-800); }
    .interp-body em     { font-style: italic; color: var(--sepia-600); }
    .interp-body code   { font-family: monospace; font-size: 8pt; background: var(--parchment-200); padding: 1px 3px; }

    .interp-body blockquote {
      border-left: 2px solid var(--gold-400);
      padding-left: 12px;
      margin: 10px 0;
      color: var(--sepia-400);
      font-style: italic;
    }

    .interp-body hr {
      border: none;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--gold-400), transparent);
      margin: 20px 0;
    }

    /* ── Footer ── */
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid var(--parchment-300);
      font-family: 'Inter', sans-serif;
      font-size: 7pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--parchment-300);
    }

    @media print {
      body { background: white; }
      .chart-section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  <header class="cover">
    <span class="cover-ornament">✦</span>
    <p class="cover-label">N e u r o C a r t a</p>
    <h1 class="cover-name">${profile.name}</h1>
    <p class="cover-meta">
      ${dateStr}${timeStr}${placeStr ? ` &nbsp;·&nbsp; ${placeStr}` : ''}
    </p>
    <hr class="cover-rule">
  </header>

  <main>
    ${chartHtml}
    ${interpretHtml}
  </main>

  <footer class="footer">✦ &nbsp; N E U R O C A R T A &nbsp; ✦</footer>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => window.print(), 400)
    })
  </script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) {
    alert('El navegador bloqueó la ventana emergente. Permite popups para esta página.')
    return
  }
  win.document.write(html)
  win.document.close()
}
