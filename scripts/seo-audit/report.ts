import type { AuditData, CheckResult, Severity, AuditSummary } from './types'
import { summarize } from './checks'

const SEVERITY_ORDER: Severity[] = ['critical', 'warning', 'info']
const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Critico',
  warning: 'Avviso',
  info: 'Informazione',
}
const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#dc2626',
  warning: '#f59e0b',
  info: '#3b82f6',
}
const TYPE_LABELS: Record<string, string> = {
  page: 'Pagine',
  'blog.post': 'Articoli',
  'blog.category': 'Categorie',
  legal: 'Legali',
  'blog.tag': 'Tag',
}

function scoreEmoji(score: number): string {
  if (score >= 90) return '🟢'
  if (score >= 70) return '🟡'
  return '🔴'
}

function calculateScore(checks: CheckResult[]): number {
  const total = checks.length
  if (total === 0) return 100
  const weights: Record<Severity, number> = { critical: 10, warning: 3, info: 1 }
  const penalty = checks.reduce((sum, c) => sum + (weights[c.severity] || 0), 0)
  const maxPenalty = total * 10
  return Math.max(0, Math.round(100 - (penalty / maxPenalty) * 100))
}

export function generateHtmlReport(data: AuditData, checks: CheckResult[]): string {
  const summary = summarize(checks)
  const score = calculateScore(checks)
  const now = new Date(data.generatedAt).toLocaleString('it-IT', { timeZone: 'Europe/Rome' })

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SEO Audit — Trm Sport</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; }
  .container { max-width: 1200px; margin: 0 auto; padding: 24px; }

  header { text-align: center; padding: 48px 24px; background: linear-gradient(135deg, #1e293b, #334155); color: white; border-radius: 16px; margin-bottom: 32px; }
  header h1 { font-size: 2rem; margin-bottom: 4px; }
  header p { color: #94a3b8; font-size: 0.9rem; }
  .score-ring { width: 120px; height: 120px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 700; margin: 16px auto; border: 6px solid ${score >= 90 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#dc2626'}; }
  .score-label { font-size: 0.85rem; color: #94a3b8; }

  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
  .card .num { font-size: 2rem; font-weight: 700; }
  .card .label { font-size: 0.85rem; color: #64748b; }

  .summary-table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 32px; }
  .summary-table th { background: #f1f5f9; text-align: left; padding: 12px 16px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
  .summary-table td { padding: 12px 16px; border-top: 1px solid #f1f5f9; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }
  .badge-critical { background: #fef2f2; color: #dc2626; }
  .badge-warning { background: #fffbeb; color: #f59e0b; }
  .badge-info { background: #eff6ff; color: #3b82f6; }

  details { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 8px; overflow: hidden; }
  details.critical { border-left: 4px solid #dc2626; }
  details.warning { border-left: 4px solid #f59e0b; }
  details.info { border-left: 4px solid #3b82f6; }
  summary { padding: 16px 20px; cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 500; }
  summary::-webkit-details-marker { display: none; }
  summary .chevron { margin-left: auto; transition: transform 0.2s; opacity: 0.4; }
  details[open] summary .chevron { transform: rotate(90deg); }
  .detail-body { padding: 0 20px 16px; }
  .meta { font-size: 0.85rem; color: #64748b; margin-bottom: 8px; }
  .meta a { color: #3b82f6; text-decoration: none; }
  .meta a:hover { text-decoration: underline; }
  .current { background: #fef2f2; padding: 8px 12px; border-radius: 8px; margin: 8px 0; font-size: 0.9rem; word-break: break-all; }
  .expected { background: #f0fdf4; padding: 8px 12px; border-radius: 8px; margin: 8px 0; font-size: 0.9rem; word-break: break-all; }
  .fix-btn { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; background: #6366f1; color: white; border: none; cursor: pointer; }
  .group-title { font-size: 1.1rem; font-weight: 600; padding: 16px 0 8px; color: #334155; }
  .empty { text-align: center; padding: 48px; color: #94a3b8; }

  footer { text-align: center; padding: 24px; color: #94a3b8; font-size: 0.85rem; }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>🔍 SEO Audit Report</h1>
    <p>Trm Sport — ${now}</p>
    <div class="score-ring">${score}<span class="score-label">/100</span></div>
    <p style="margin-top: 8px; font-size: 0.9rem">${score >= 90 ? 'Ottimo! 🎉' : score >= 70 ? 'Buono, ma ci sono margini di miglioramento' : 'Attenzione: molti problemi da risolvere'}</p>
  </header>

  <div class="grid">
    <div class="card"><div class="num">${checks.length}</div><div class="label">Totale problemi</div></div>
    <div class="card"><div class="num" style="color:#dc2626">${summary.bySeverity.critical}</div><div class="label">Critici</div></div>
    <div class="card"><div class="num" style="color:#f59e0b">${summary.bySeverity.warning}</div><div class="label">Avvisi</div></div>
    <div class="card"><div class="num" style="color:#3b82f6">${summary.bySeverity.info}</div><div class="label">Info</div></div>
    <div class="card"><div class="num">${data.pages.length + data.posts.length + data.categories.length + data.legal.length}</div><div class="label">Documenti controllati</div></div>
    <div class="card"><div class="num">${data.posts.length}</div><div class="label">Articoli</div></div>
  </div>

  <table class="summary-table">
    <thead><tr><th>Tipo</th><th>Totale</th><th>Critici</th><th>Avvisi</th><th>Info</th></tr></thead>
    <tbody>
      ${Object.entries(summary.byType).map(([type, s]) => `<tr>
        <td><strong>${TYPE_LABELS[type] || type}</strong></td>
        <td>${s.total}</td>
        <td>${s.critical > 0 ? `<span class="badge badge-critical">${s.critical}</span>` : '0'}</td>
        <td>${s.warning > 0 ? `<span class="badge badge-warning">${s.warning}</span>` : '0'}</td>
        <td>${s.info > 0 ? `<span class="badge badge-info">${s.info}</span>` : '0'}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  ${SEVERITY_ORDER.map((severity) => {
    const filtered = checks.filter((c) => c.severity === severity)
    if (filtered.length === 0) return ''
    return `<div class="group-title" style="color:${SEVERITY_COLORS[severity]}">${scoreEmoji(score)} ${SEVERITY_LABELS[severity]} (${filtered.length})</div>
      ${filtered.map((c) => `<details class="${severity}">
        <summary>
          <span class="badge badge-${severity}">${c.label}</span>
          <span style="font-size:0.9rem;flex:1">${c.docTitle}</span>
          <span class="chevron">›</span>
        </summary>
        <div class="detail-body">
          <div class="meta">
            <a href="${c.docUrl}" target="_blank">${c.docUrl}</a>
            &middot; ${c.docType} &middot; <code>${c.docId}</code>
          </div>
          <p>${c.message}</p>
          ${c.current ? `<div class="current"><strong>Valore attuale:</strong> ${c.current}</div>` : ''}
          ${c.expected ? `<div class="expected"><strong>Consigliato:</strong> ${c.expected}</div>` : ''}
        </div>
      </details>`).join('')}`
  }).join('')}

  <footer>
    <p>Generato automaticamente da SEO Audit per Trm Sport &mdash; ${now}</p>
    <p style="margin-top:4px">${data.pages.length} pagine &middot; ${data.posts.length} articoli &middot; ${data.categories.length} categorie &middot; ${data.legal.length} legali &middot; ${data.tags.length} tag</p>
  </footer>
</div>
</body>
</html>`
}
