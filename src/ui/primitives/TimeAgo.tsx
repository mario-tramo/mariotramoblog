'use client'

import { useEffect, useState } from 'react'

const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']

function computeRelativeTime(date: Date): string | null {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  const diffD = Math.floor(diffH / 24)

  if (diffH < 1) return 'Ora'
  if (diffH < 24) return `${diffH}h fa`
  if (diffD < 7) return `${diffD}g fa`
  return null
}

function formatAbsolute(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

// publishDate can be date-only ('2025-07-01') or full datetime ('2025-07-01T14:30:00Z')
function parseDate(dateStr: string): Date {
  return new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00')
}

export default function TimeAgo({ dateStr }: { dateStr: string }) {
  const date = parseDate(dateStr)
  const valid = !isNaN(date.getTime())
  const [text, setText] = useState(valid ? formatAbsolute(date) : '')

  useEffect(() => {
    if (!valid) return
    setText(computeRelativeTime(date) ?? formatAbsolute(date))
  }, [dateStr])

  if (!valid) return null

  return <>{text}</>
}
