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

export default function TimeAgo({ dateStr }: { dateStr: string }) {
  const date = new Date(dateStr + 'T00:00:00')
  const [text, setText] = useState(formatAbsolute(date))

  useEffect(() => {
    setText(computeRelativeTime(date) ?? formatAbsolute(date))
  }, [dateStr])

  return <>{text}</>
}
