import { createClient, type SanityClient } from '@sanity/client'
import type { CheckResult } from './types'

const AUTO_FIXABLE_IDS = new Set([
  'title-too-short',
  'title-too-long',
  'image-alt-missing',
])

const FIX_LABELS: Record<string, string> = {
  'title-too-short': 'Usa il titolo del documento come meta title (se vuoto)',
  'title-too-long': 'Usa il titolo del documento come meta title (troncato a 70 caratteri)',
  'image-alt-missing': 'Usa il titolo del documento come alt text',
}

export function getAutoFixable(checks: CheckResult[]): CheckResult[] {
  return checks.filter((c) => c.autoFixable && AUTO_FIXABLE_IDS.has(c.id))
}

export function isFixable(check: CheckResult): boolean {
  return check.autoFixable && AUTO_FIXABLE_IDS.has(check.id)
}

interface FixSpec {
  check: CheckResult
  patch: Record<string, unknown>
}

export function buildFixes(checks: CheckResult[]): FixSpec[] {
  const fixes: FixSpec[] = []

  for (const check of checks) {
    if (!isFixable(check)) continue

    if (check.id === 'title-too-short' || check.id === 'title-too-long') {
      if (check.docTitle && check.docTitle !== check.current) {
        fixes.push({
          check,
          patch: { 'metadata.title': check.docTitle },
        })
      }
    }

    if (check.id === 'image-alt-missing') {
      fixes.push({
        check,
        patch: { 'metadata.image.alt': check.docTitle || 'Immagine' },
      })
    }
  }

  return fixes
}

export async function applyFixes(
  fixes: FixSpec[],
  dryRun = true,
  token?: string,
): Promise<{ applied: number; errors: { id: string; error: string }[] }> {
  const applied = 0
  const errors: { id: string; error: string }[] = []

  if (fixes.length === 0) return { applied, errors }

  if (dryRun) {
    return { applied: fixes.length, errors }
  }

  if (!token) {
    return { applied: 0, errors: [{ id: 'no-token', error: 'SANITY_API_WRITE_TOKEN required' }] }
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'geqdctr3'
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

  const client: SanityClient = createClient({
    projectId,
    dataset,
    token,
    apiVersion: '2025-01-01',
    useCdn: false,
  })

  for (const fix of fixes) {
    try {
      await client.patch(fix.check.docId).set(fix.patch).commit()
    } catch (err) {
      errors.push({ id: fix.check.docId, error: String(err) })
    }
  }

  return { applied: fixes.length - errors.length, errors }
}
