import type { AuditDoc, AuditData, CheckResult, Severity } from './types'

function r(
  id: string,
  doc: AuditDoc,
  severity: Severity,
  label: string,
  message: string,
  current?: string,
  expected?: string,
  autoFixable = false,
): CheckResult {
  return {
    id,
    docId: doc._id,
    docType: doc._type,
    docTitle: doc.title || doc.metadata?.title || '(senza titolo)',
    docUrl: doc.url || '/',
    severity,
    label,
    message,
    current,
    expected,
    autoFixable,
  }
}

function checkMetadata(doc: AuditDoc, results: CheckResult[]) {
  const m = doc.metadata
  if (!m) {
    const sev = doc._type === 'blog.category' ? 'warning' : 'critical'
    results.push(r('metadata-missing', doc, sev, 'Metadata mancanti', 'Il documento non ha un oggetto metadata — nessun title SEO, description, OG image'))
    return
  }

  // Slug
  if (!m.slug?.current) {
    results.push(r('slug-missing', doc, 'critical', 'Slug mancante', 'Lo slug è obbligatorio per generare URL', undefined, '/esempio-slug'))
  } else if (m.slug.current.length > 100) {
    results.push(r('slug-too-long', doc, 'warning', 'Slug troppo lungo', `${m.slug.current.length} caratteri`, m.slug.current, 'max 100'))
  } else if (!/^[a-z0-9-]+$/.test(m.slug.current)) {
    results.push(r('slug-invalid', doc, 'warning', 'Slug con caratteri non validi', 'Solo minuscole, numeri e trattini', m.slug.current))
  }

  // Title
  if (!m.title || !m.title.trim()) {
    results.push(r('title-missing', doc, 'critical', 'Title mancante', 'Il meta title è obbligatorio per SEO', undefined, doc.title || 'Usa il titolo della pagina'))
  } else {
    const len = m.title.length
    if (len < 30) {
      results.push(r('title-too-short', doc, 'warning', 'Title troppo corto', `${len} caratteri (min 30)`, m.title, '30-70 caratteri', true))
    } else if (len > 70) {
      results.push(r('title-too-long', doc, 'warning', 'Title troppo lungo', `${len} caratteri (max 70)`, m.title, '30-70 caratteri', true))
    }
  }

  // Description
  if (!m.description || !m.description.trim()) {
    results.push(r('description-missing', doc, 'critical', 'Meta description mancante', 'La meta description è obbligatoria per SEO'))
  } else {
    const len = m.description.length
    if (len < 120) {
      results.push(r('description-too-short', doc, 'warning', 'Description troppo corta', `${len} caratteri (min 120)`, m.description, '120-170 caratteri', true))
    } else if (len > 170) {
      results.push(r('description-too-long', doc, 'warning', 'Description troppo lunga', `${len} caratteri (max 170)`, m.description, '120-170 caratteri', true))
    }
  }

  // Image
  if (!m.image) {
    results.push(r('image-missing', doc, 'warning', 'Immagine OG mancante', 'Migliora la condivisione social', undefined, 'Aggiungi un\'immagine'))
  } else if (!m.image.alt) {
    results.push(r('image-alt-missing', doc, 'warning', 'Alt text immagine mancante', 'L\'alt text è obbligatorio per accessibilità e SEO', undefined, 'Descrizione dell\'immagine', true))
  }

  // Keywords
  if (!m.keywords || m.keywords.length === 0) {
    results.push(r('keywords-missing', doc, 'info', 'Keywords mancanti', 'Aggiungi 3-5 parole chiave'))
  } else if (m.keywords.length < 3) {
    results.push(r('keywords-too-few', doc, 'info', 'Poche keywords', `${m.keywords.length} keywords (min 3 consigliate)`, m.keywords.join(', ')))
  } else if (m.keywords.length > 5) {
    results.push(r('keywords-too-many', doc, 'info', 'Troppe keywords', `${m.keywords.length} keywords (max 5 consigliate)`, m.keywords.join(', ')))
  }

  // noIndex
  if (m.noIndex) {
    results.push(r('noindex-active', doc, 'info', 'noIndex attivo', 'La pagina non verrà indicizzata dai motori di ricerca'))
  }

  // Canonical
  if (m.canonicalUrl) {
    results.push(r('canonical-set', doc, 'info', 'Canonical URL impostato', m.canonicalUrl, m.canonicalUrl))
  }
}

function checkPostSpecific(doc: AuditDoc, results: CheckResult[]) {
  if (doc._type !== 'blog.post') return

  if (!doc.categories || doc.categories.length === 0) {
    results.push(r('post-no-categories', doc, 'critical', 'Nessuna categoria', 'I post devono avere almeno una categoria'))
  }

  if (!doc.tags || doc.tags.length === 0) {
    results.push(r('post-no-tags', doc, 'warning', 'Nessun tag', 'I tag migliorano la navigabilità e SEO'))
  }

  if (!doc.authors || doc.authors.length === 0) {
    results.push(r('post-no-authors', doc, 'warning', 'Nessun autore', 'Gli autori migliorano E-E-A-T'))
  }

  if (!doc.publishDate) {
    results.push(r('post-no-publish-date', doc, 'critical', 'Data di pubblicazione mancante', 'Fondamentale per NewsArticle JSON-LD e news sitemap'))
  }

  if (doc.bodyLength !== null && doc.bodyLength !== undefined && doc.bodyLength < 300) {
    results.push(r('post-too-short', doc, 'warning', 'Articolo troppo corto', `${Math.round(doc.bodyLength / 5)} parole stimate (min ~300 caratteri di testo)`, String(doc.bodyLength), 'Min 300 caratteri'))
  }

  if (doc.bodyBlocks !== null && doc.bodyBlocks !== undefined && doc.bodyBlocks === 0) {
    results.push(r('post-empty-body', doc, 'critical', 'Corpo articolo vuoto', 'Nessun blocco di contenuto presente'))
  }
}

function checkCategorySpecific(doc: AuditDoc, results: CheckResult[]) {
  if (doc._type !== 'blog.category') return

  const m = doc.metadata
  if (!m?.description && !m?.title) {
    const hasModules = false
    if (!hasModules) {
      results.push(r('category-bare', doc, 'warning', 'Categoria senza contenuti', 'Categoria senza metadata title/description e senza moduli'))
    }
  }
}

export function runAllChecks(data: AuditData): CheckResult[] {
  const results: CheckResult[] = []
  const allDocs: AuditDoc[] = [
    ...data.pages,
    ...data.posts,
    ...data.categories,
    ...data.legal,
  ]

  for (const doc of allDocs) {
    checkMetadata(doc, results)
    checkPostSpecific(doc, results)
    checkCategorySpecific(doc, results)
  }

  // Cross-document: duplicate titles (same type)
  const titlesByType = new Map<string, Map<string, AuditDoc[]>>()
  for (const doc of allDocs) {
    const t = doc.metadata?.title?.trim().toLowerCase()
    if (!t) continue
    if (!titlesByType.has(doc._type)) titlesByType.set(doc._type, new Map())
    const byType = titlesByType.get(doc._type)!
    if (!byType.has(t)) byType.set(t, [])
    byType.get(t)!.push(doc)
  }
  for (const [, byType] of titlesByType) {
    for (const [, docs] of byType) {
      if (docs.length > 1) {
        const titles = docs.map((d) => d.metadata?.title).join(', ')
        for (const doc of docs) {
          results.push(r('duplicate-title', doc, 'warning', 'Title duplicato', `Usato anche da: ${docs.filter((d) => d._id !== doc._id).map((d) => `${d.metadata?.title || d.title} (${d._id})`).join(', ')}`, doc.metadata?.title || '', 'Ogni pagina deve avere un title unico'))
        }
      }
    }
  }

  // Cross-document: duplicate slugs
  const slugsByType = new Map<string, Map<string, AuditDoc[]>>()
  for (const doc of allDocs) {
    const s = doc.metadata?.slug?.current?.toLowerCase()
    if (!s) continue
    if (!slugsByType.has(doc._type)) slugsByType.set(doc._type, new Map())
    const byType = slugsByType.get(doc._type)!
    if (!byType.has(s)) byType.set(s, [])
    byType.get(s)!.push(doc)
  }
  for (const [, byType] of slugsByType) {
    for (const [, docs] of byType) {
      if (docs.length > 1) {
        for (const doc of docs) {
          results.push(r('duplicate-slug', doc, 'critical', 'Slug duplicato', `Usato anche da: ${docs.filter((d) => d._id !== doc._id).map((d) => d._id).join(', ')}`, doc.metadata?.slug?.current || ''))
        }
      }
    }
  }

  // Tags with no metadata
  for (const tag of data.tags) {
    if (!tag.title) {
      results.push({
        id: 'tag-no-title',
        docId: tag._id,
        docType: 'blog.tag',
        docTitle: '(senza titolo)',
        docUrl: tag.url || '/',
        severity: 'warning',
        label: 'Tag senza titolo',
        message: 'Un tag deve avere un titolo',
        autoFixable: false,
      })
    }
  }

  return results
}

export function summarize(checks: CheckResult[]): {
  total: number
  bySeverity: Record<Severity, number>
  byType: Record<string, { total: number; critical: number; warning: number; info: number }>
} {
  const bySeverity: Record<Severity, number> = { critical: 0, warning: 0, info: 0 }
  const byType: Record<string, { total: number; critical: number; warning: number; info: number }> = {}

  for (const c of checks) {
    bySeverity[c.severity]++
    if (!byType[c.docType]) byType[c.docType] = { total: 0, critical: 0, warning: 0, info: 0 }
    byType[c.docType].total++
    byType[c.docType][c.severity]++
  }

  return { total: checks.length, bySeverity, byType }
}
