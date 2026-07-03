export type DocType = 'page' | 'blog.post' | 'blog.category' | 'legal' | 'blog.tag'

export interface AuditDoc {
  _id: string
  _type: DocType
  _updatedAt?: string
  title?: string
  slug?: string
  url?: string
  metadata?: AuditMetadata | null
  publishDate?: string | null
  categories?: { _id: string; title: string; slug: string }[] | null
  tags?: { _id: string; title: string }[] | null
  authors?: { _id: string; name: string }[] | null
  bodyLength?: number | null
  bodyBlocks?: number | null
}

export interface AuditMetadata {
  slug?: { current: string } | null
  title?: string | null
  description?: string | null
  image?: { alt?: string; asset?: { url?: string } } | null
  keywords?: string[] | null
  noIndex?: boolean | null
  canonicalUrl?: string | null
}

export type Severity = 'critical' | 'warning' | 'info'

export interface CheckResult {
  id: string
  docId: string
  docType: DocType
  docTitle: string
  docUrl: string
  severity: Severity
  label: string
  message: string
  current?: string
  expected?: string
  autoFixable: boolean
}

export interface AuditSummary {
  total: number
  bySeverity: Record<Severity, number>
  byType: Record<DocType, { total: number; critical: number; warning: number; info: number }>
  checks: CheckResult[]
}

export interface AuditData {
  pages: AuditDoc[]
  posts: AuditDoc[]
  categories: AuditDoc[]
  tags: AuditDoc[]
  legal: AuditDoc[]
  site: { title?: string; ogimage?: string } | null
  generatedAt: string
}
