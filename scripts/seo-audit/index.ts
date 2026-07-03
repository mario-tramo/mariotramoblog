#!/usr/bin/env tsx
/**
 * SEO Audit CLI per Trm Sport
 *
 * Uso:
 *   pnpm seo:audit                  # genera report HTML
 *   pnpm seo:audit --ci             # esce con exit code 1 se ci sono critici
 *   pnpm seo:audit --fix            # mostra cosa può essere auto-fissato
 *   pnpm seo:audit --fix --apply    # applica le correzioni automatiche
 *   pnpm seo:audit --json           # output JSON su stdout
 *   pnpm seo:audit --help           # mostra aiuto
 */

import { createClient, type SanityClient } from '@sanity/client'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import { AUDIT_QUERY } from './query'
import { runAllChecks, summarize } from './checks'
import { generateHtmlReport } from './report'
import { getAutoFixable, buildFixes, applyFixes } from './fix'
import type { AuditData, AuditSummary } from './types'

config({ path: resolve(__dirname, '../../.env.local') })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'geqdctr3'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const readToken = process.env.SANITY_API_READ_TOKEN
const writeToken = process.env.SANITY_API_WRITE_TOKEN

const args = process.argv.slice(2)
const flags = {
  ci: args.includes('--ci'),
  fix: args.includes('--fix') || args.includes('--fix-dry'),
  apply: args.includes('--apply'),
  json: args.includes('--json'),
  help: args.includes('--help') || args.includes('-h'),
  output: extractArg('--output') || extractArg('-o'),
}

function extractArg(name: string): string | undefined {
  const idx = args.indexOf(name)
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1]
  return undefined
}

function help(): void {
  console.log(`
SEO Audit — Trm Sport

Uso:
  pnpm seo:audit [flags]

Flags:
  --ci              Exit code 1 se ci sono problemi critici
  --fix             Mostra cosa può essere auto-corretto (dry-run)
  --fix --apply     Applica le correzioni automatiche (serve SANITY_API_WRITE_TOKEN)
  --json            Output JSON su stdout
  --output <file>   Salva report HTML in percorso custom
  --help, -h        Mostra questo aiuto

Esempi:
  pnpm seo:audit
  pnpm seo:audit --ci
  pnpm seo:audit --fix --apply
  pnpm seo:audit --json > audit.json
  pnpm seo:audit --output docs/audit.html
`)
}

async function main(): Promise<void> {
  if (flags.help) {
    help()
    process.exit(0)
  }

  // Sanity client
  if (!readToken) {
    console.error('❌ SANITY_API_READ_TOKEN non trovato in .env.local')
    process.exit(1)
  }

  const client: SanityClient = createClient({
    projectId,
    dataset,
    token: readToken,
    apiVersion: '2025-01-01',
    useCdn: false,
  })

  const log = flags.json ? (...args: unknown[]) => console.error(...args) : (...args: unknown[]) => console.log(...args)

  log(`🔍 Avvio audit SEO per "${projectId}/${dataset}"...`)
  log('')

  // Fetch data
  const data: AuditData = await client.fetch(AUDIT_QUERY)
  data.generatedAt = new Date().toISOString()

  log(`   Documenti trovati:`)
  log(`   • ${data.pages.length} pagine`)
  log(`   • ${data.posts.length} articoli`)
  log(`   • ${data.categories.length} categorie`)
  log(`   • ${data.legal.length} legali`)
  log(`   • ${data.tags.length} tag`)
  log('')

  // Run checks
  const checks = runAllChecks(data)
  const summary = summarize(checks)

  log(`📊 Risultati:`)
  log(`   • ${summary.total} problemi totali`)
  log(`   • ${summary.bySeverity.critical} critici`)
  log(`   • ${summary.bySeverity.warning} warning`)
  log(`   • ${summary.bySeverity.info} info`)
  log('')

  // Top criticals
  const criticals = checks.filter((c) => c.severity === 'critical')
  if (criticals.length > 0) {
    log(`🔴 Problemi critici:`)
    for (const c of criticals.slice(0, 10)) {
      log(`   • [${c.docType}] ${c.docTitle}: ${c.message}`)
    }
    if (criticals.length > 10) {
      log(`   ... e altri ${criticals.length - 10} problemi critici`)
    }
    log('')
  }

  // JSON output
  if (flags.json) {
    const output: AuditSummary = {
      total: summary.total,
      bySeverity: summary.bySeverity as AuditSummary['bySeverity'],
      byType: summary.byType as AuditSummary['byType'],
      checks,
    }
    console.log(JSON.stringify(output, null, 2))
    process.exit(0)
  }

  // Fix mode
  if (flags.fix) {
    const fixable = getAutoFixable(checks)
    if (fixable.length === 0) {
      console.log('✅ Nessun problema auto-correggibile trovato.')
    } else {
      const fixes = buildFixes(fixable)
      console.log(`🛠  Auto-fix disponibili (${fixes.length}):`)
      for (const f of fixes) {
      console.log(`   • [${f.check.docType}] ${f.check.docTitle}: ${f.check.label}`)
      console.log(`     → ${JSON.stringify(f.patch)}`)
      console.log(`     📝 ${f.check.message}`)
      }
      console.log('')

      if (flags.apply) {
        console.log('⏳ Applicazione correzioni...')
        const result = await applyFixes(fixes, false, writeToken)
        console.log(`   ✅ ${result.applied} correzioni applicate`)
        for (const err of result.errors) {
          console.error(`   ❌ ${err.id}: ${err.error}`)
        }
      } else {
        console.log('💡 Aggiungi --apply per applicare le correzioni')
      }
    }
    console.log('')
  }

  // HTML report
  const html = generateHtmlReport(data, checks)
  const outputPath = flags.output || resolve(__dirname, '../../docs/seo-audit-report.html')
  mkdirSync(resolve(outputPath, '..'), { recursive: true })
  writeFileSync(outputPath, html, 'utf-8')
  console.log(`📄 Report HTML salvato: ${outputPath}`)
  console.log('')

  // Exit code per CI
  if (flags.ci && criticals.length > 0) {
    console.error(`❌ CI FAIL: ${criticals.length} problemi critici trovati`)
    process.exit(1)
  }

  console.log('✅ Audit completato.')
}

main().catch((err) => {
  console.error('❌ Errore:', err)
  process.exit(1)
})
