'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useClient } from 'sanity'
import {
	Box,
	Button,
	Card,
	Flex,
	Grid,
	Heading,
	Spinner,
	Stack,
	Text,
	Badge,
	Tab,
	TabList,
	TabPanel,
} from '@sanity/ui'
import {
	CalendarIcon,
	DocumentIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ClockIcon,
	WarningOutlineIcon,
	PublishIcon,
} from '@sanity/icons'

// ——— Types ———

interface ScheduledDoc {
	_id: string
	_type: string
	title: string
	publishAt?: string
	publishDate?: string
	date: string
	status: 'published' | 'scheduled' | 'overdue'
}

type ViewTab = 'calendar' | 'list'

// ——— Helpers ———

const TYPE_LABELS: Record<string, string> = {
	'blog.post': 'Articolo',
	page: 'Pagina',
	legal: 'Legale',
}

const STATUS_LABELS: Record<string, string> = {
	published: 'Pubblicato',
	scheduled: 'Programmato',
	overdue: 'In ritardo',
}

const STATUS_TONES: Record<string, 'positive' | 'caution' | 'critical'> = {
	published: 'positive',
	scheduled: 'caution',
	overdue: 'critical',
}

function docTitle(doc: ScheduledDoc) {
	return doc.title || doc._id.replace('drafts.', '')
}

function formatDateTime(iso: string) {
	return new Date(iso).toLocaleString('it-IT', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

function formatDateShort(iso: string) {
	return new Date(iso).toLocaleString('it-IT', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	})
}

function formatTime(iso: string) {
	return new Date(iso).toLocaleTimeString('it-IT', {
		hour: '2-digit',
		minute: '2-digit',
	})
}

function isSameDay(a: Date, b: Date) {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	)
}

function getDaysInMonth(year: number, month: number) {
	return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
	const day = new Date(year, month, 1).getDay()
	return day === 0 ? 6 : day - 1 // Monday = 0
}

const MONTH_NAMES = [
	'Gennaio',
	'Febbraio',
	'Marzo',
	'Aprile',
	'Maggio',
	'Giugno',
	'Luglio',
	'Agosto',
	'Settembre',
	'Ottobre',
	'Novembre',
	'Dicembre',
]

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

// ——— Query ———

const QUERY = `{
  "scheduled": *[
    _id in path("drafts.**") &&
    defined(publishAt)
  ]{
    _id,
    _type,
    publishAt,
    "title": coalesce(metadata.title, title, _id)
  } | order(publishAt asc),
  "published": *[
    _type in ["blog.post", "page", "legal"] &&
    !(_id in path("drafts.**")) &&
    (defined(publishDate) || defined(_createdAt))
  ]{
    _id,
    _type,
    publishDate,
    _createdAt,
    "title": coalesce(metadata.title, title, _id)
  } | order(publishDate desc, _createdAt desc)
}`

function processResults(data: {
	scheduled: Array<{
		_id: string
		_type: string
		title: string
		publishAt: string
	}>
	published: Array<{
		_id: string
		_type: string
		title: string
		publishDate?: string
		_createdAt: string
	}>
}): ScheduledDoc[] {
	const now = new Date()
	const docs: ScheduledDoc[] = []

	for (const d of data.scheduled) {
		docs.push({
			_id: d._id,
			_type: d._type,
			title: d.title,
			publishAt: d.publishAt,
			date: d.publishAt,
			status: new Date(d.publishAt) <= now ? 'overdue' : 'scheduled',
		})
	}

	const scheduledIds = new Set(
		data.scheduled.map((d) => d._id.replace('drafts.', '')),
	)

	for (const d of data.published) {
		if (scheduledIds.has(d._id)) continue
		const date = d.publishDate || d._createdAt
		docs.push({
			_id: d._id,
			_type: d._type,
			title: d.title,
			publishDate: date,
			date,
			status: 'published',
		})
	}

	return docs.sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	)
}

// ——— Popover for day cell ———

function DayPopover({
	docs,
	anchorRef,
	onClose,
	onNavigate,
}: {
	docs: ScheduledDoc[]
	anchorRef: React.RefObject<HTMLDivElement | null>
	onClose: () => void
	onNavigate: (id: string, type: string) => void
}) {
	const popoverRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node) &&
				anchorRef.current &&
				!anchorRef.current.contains(e.target as Node)
			) {
				onClose()
			}
		}
		document.addEventListener('mousedown', handleClick)
		return () => document.removeEventListener('mousedown', handleClick)
	}, [onClose, anchorRef])

	return (
		<div
			ref={popoverRef}
			style={{
				position: 'absolute',
				top: '100%',
				left: '50%',
				transform: 'translateX(-50%)',
				zIndex: 100,
				minWidth: 260,
				maxWidth: 320,
			}}
		>
			<Card padding={3} radius={3} shadow={3} tone="default" border>
				<Stack space={2}>
					<Text size={0} weight="bold" muted>
						{docs.length} {docs.length === 1 ? 'contenuto' : 'contenuti'}
					</Text>
					{docs.map((doc) => (
						<Card
							key={doc._id}
							padding={2}
							radius={2}
							tone={STATUS_TONES[doc.status]}
							as="button"
							onClick={() => onNavigate(doc._id, doc._type)}
							style={{ cursor: 'pointer', textAlign: 'left', border: 'none' }}
						>
							<Stack space={1}>
								<Text size={1} weight="bold">
									{docTitle(doc)}
								</Text>
								<Flex align="center" gap={2}>
									<Badge tone={STATUS_TONES[doc.status]} fontSize={0}>
										{TYPE_LABELS[doc._type] || doc._type}
									</Badge>
									<Text size={0} muted>
										{formatDateShort(doc.date)}
									</Text>
								</Flex>
							</Stack>
						</Card>
					))}
				</Stack>
			</Card>
		</div>
	)
}

// ——— Calendar Day Cell ———

function DayCell({
	day,
	isToday,
	docs,
	onNavigate,
}: {
	day: number
	isToday: boolean
	docs: ScheduledDoc[]
	onNavigate: (id: string, type: string) => void
}) {
	const [open, setOpen] = useState(false)
	const cellRef = useRef<HTMLDivElement>(null)

	const hasDocs = docs.length > 0

	return (
		<div ref={cellRef} style={{ position: 'relative' }}>
			<Card
				padding={2}
				radius={2}
				tone={isToday ? 'primary' : 'default'}
				border
				style={{
					minHeight: 80,
					cursor: hasDocs ? 'pointer' : 'default',
					transition: 'background 150ms',
				}}
				onClick={() => hasDocs && setOpen(!open)}
			>
				<Stack space={2}>
					<Flex align="center" justify="space-between" gap={2}>
						<Text size={0} weight={isToday ? 'bold' : 'regular'}>
							{day}
						</Text>
						{hasDocs && (
							<Text size={0} muted>
								{docs.length === 1
									? formatTime(docs[0].date)
									: `${docs.length} contenuti`}
							</Text>
						)}
					</Flex>

					{hasDocs && (
						<Stack space={1}>
							{docs.slice(0, 2).map((doc) => (
								<Card
									key={doc._id}
									padding={1}
									radius={2}
									tone={STATUS_TONES[doc.status]}
								>
									<Text
										size={0}
										style={{
											whiteSpace: 'normal',
											overflowWrap: 'anywhere',
											lineHeight: 1.25,
										}}
									>
										{docTitle(doc)}
									</Text>
								</Card>
							))}
							{docs.length > 2 && (
								<Text size={0} muted weight="bold">
									+{docs.length - 2} altri
								</Text>
							)}
						</Stack>
					)}
				</Stack>
			</Card>
			{open && (
				<DayPopover
					docs={docs}
					anchorRef={cellRef}
					onClose={() => setOpen(false)}
					onNavigate={onNavigate}
				/>
			)}
		</div>
	)
}

// ——— Components ———

function CalendarView({
	docs,
	onNavigate,
}: {
	docs: ScheduledDoc[]
	onNavigate: (id: string, type: string) => void
}) {
	const today = new Date()
	const [year, setYear] = useState(today.getFullYear())
	const [month, setMonth] = useState(today.getMonth())

	const daysInMonth = getDaysInMonth(year, month)
	const firstDay = getFirstDayOfWeek(year, month)

	const docsInMonth = useMemo(
		() =>
			docs.filter((d) => {
				const dt = new Date(d.date)
				return dt.getFullYear() === year && dt.getMonth() === month
			}),
		[docs, year, month],
	)

	function docsForDay(day: number) {
		const target = new Date(year, month, day)
		return docsInMonth.filter((d) => isSameDay(new Date(d.date), target))
	}

	function prevMonth() {
		if (month === 0) {
			setYear(year - 1)
			setMonth(11)
		} else {
			setMonth(month - 1)
		}
	}

	function nextMonth() {
		if (month === 11) {
			setYear(year + 1)
			setMonth(0)
		} else {
			setMonth(month + 1)
		}
	}

	function goToday() {
		setYear(today.getFullYear())
		setMonth(today.getMonth())
	}

	const cells: (number | null)[] = [
		...Array(firstDay).fill(null),
		...Array.from({ length: daysInMonth }, (_, i) => i + 1),
	]
	while (cells.length % 7 !== 0) cells.push(null)

	const monthDocCount = docsInMonth.length

	return (
		<Stack space={4}>
			{/* Header */}
			<Flex align="center" justify="space-between">
				<Flex align="center" gap={2}>
					<Button
						icon={ChevronLeftIcon}
						mode="bleed"
						onClick={prevMonth}
						aria-label="Mese precedente"
					/>
					<Button text="Oggi" mode="bleed" fontSize={0} onClick={goToday} />
					<Button
						icon={ChevronRightIcon}
						mode="bleed"
						onClick={nextMonth}
						aria-label="Mese successivo"
					/>
				</Flex>
				<Heading size={1}>
					{MONTH_NAMES[month]} {year}
				</Heading>
				<Badge tone="primary" fontSize={0}>
					{monthDocCount} {monthDocCount === 1 ? 'contenuto' : 'contenuti'}
				</Badge>
			</Flex>

			{/* Day headers */}
			<Grid columns={7} gap={1}>
				{DAY_NAMES.map((d) => (
					<Card key={d} padding={2}>
						<Text size={0} weight="bold" align="center" muted>
							{d}
						</Text>
					</Card>
				))}
			</Grid>

			{/* Calendar grid */}
			<Grid columns={7} gap={1}>
				{cells.map((day, i) => {
					if (day === null) {
						return (
							<Card key={`empty-${i}`} padding={2} style={{ minHeight: 80 }} />
						)
					}

					const dayDocs = docsForDay(day)
					const isToday = isSameDay(new Date(year, month, day), today)

					return (
						<DayCell
							key={day}
							day={day}
							isToday={isToday}
							docs={dayDocs}
							onNavigate={onNavigate}
						/>
					)
				})}
			</Grid>

			{/* Legend */}
			<Flex align="center" gap={4} justify="center">
				<Flex align="center" gap={2}>
					<Card
						padding={1}
						radius={2}
						tone="positive"
						style={{ width: 12, height: 12 }}
					/>
					<Text size={0} muted>
						Pubblicato
					</Text>
				</Flex>
				<Flex align="center" gap={2}>
					<Card
						padding={1}
						radius={2}
						tone="caution"
						style={{ width: 12, height: 12 }}
					/>
					<Text size={0} muted>
						Programmato
					</Text>
				</Flex>
				<Flex align="center" gap={2}>
					<Card
						padding={1}
						radius={2}
						tone="critical"
						style={{ width: 12, height: 12 }}
					/>
					<Text size={0} muted>
						In ritardo
					</Text>
				</Flex>
			</Flex>
		</Stack>
	)
}

function ListView({
	docs,
	onNavigate,
}: {
	docs: ScheduledDoc[]
	onNavigate: (id: string, type: string) => void
}) {
	const overdue = docs.filter((d) => d.status === 'overdue')
	const scheduled = docs.filter((d) => d.status === 'scheduled')
	const published = docs.filter((d) => d.status === 'published').slice(0, 30)

	return (
		<Stack space={5}>
			{overdue.length > 0 && (
				<Stack space={3}>
					<Flex align="center" gap={2}>
						<Text size={1}>
							<WarningOutlineIcon />
						</Text>
						<Heading size={0}>In ritardo ({overdue.length})</Heading>
					</Flex>
					{overdue.map((doc) => (
						<DocRow key={doc._id} doc={doc} onNavigate={onNavigate} />
					))}
				</Stack>
			)}

			{scheduled.length > 0 && (
				<Stack space={3}>
					<Flex align="center" gap={2}>
						<Text size={1}>
							<ClockIcon />
						</Text>
						<Heading size={0}>Programmati ({scheduled.length})</Heading>
					</Flex>
					{scheduled.map((doc) => (
						<DocRow key={doc._id} doc={doc} onNavigate={onNavigate} />
					))}
				</Stack>
			)}

			<Stack space={3}>
				<Flex align="center" gap={2}>
					<Text size={1}>
						<PublishIcon />
					</Text>
					<Heading size={0}>Pubblicati recenti ({published.length})</Heading>
				</Flex>
				{published.length === 0 ? (
					<Card padding={4} radius={2} tone="transparent">
						<Text size={1} muted align="center">
							Nessun contenuto pubblicato
						</Text>
					</Card>
				) : (
					published.map((doc) => (
						<DocRow key={doc._id} doc={doc} onNavigate={onNavigate} />
					))
				)}
			</Stack>
		</Stack>
	)
}

function DocRow({
	doc,
	onNavigate,
}: {
	doc: ScheduledDoc
	onNavigate: (id: string, type: string) => void
}) {
	return (
		<Card
			padding={3}
			radius={2}
			border
			tone={doc.status === 'overdue' ? 'critical' : 'default'}
			as="button"
			onClick={() => onNavigate(doc._id, doc._type)}
			style={{ cursor: 'pointer', textAlign: 'left', width: '100%' }}
		>
			<Flex align="center" justify="space-between" gap={3} wrap="wrap">
				<Flex align="center" gap={3} style={{ flex: 1 }}>
					<Text size={1}>
						<DocumentIcon />
					</Text>
					<Stack space={2}>
						<Text size={1} weight="bold">
							{docTitle(doc)}
						</Text>
						<Text size={0} muted>
							{formatDateTime(doc.date)}
						</Text>
					</Stack>
				</Flex>

				<Flex align="center" gap={2} style={{ flexShrink: 0 }}>
					<Badge tone={STATUS_TONES[doc.status]} fontSize={0}>
						{TYPE_LABELS[doc._type] || doc._type}
					</Badge>
					<Badge tone={STATUS_TONES[doc.status]} fontSize={0}>
						{STATUS_LABELS[doc.status]}
					</Badge>
				</Flex>
			</Flex>
		</Card>
	)
}

// ——— Main Tool Component ———

export function SchedulingToolComponent() {
	const client = useClient({ apiVersion: '2024-12-01' })
	const [docs, setDocs] = useState<ScheduledDoc[]>([])
	const [loading, setLoading] = useState(true)
	const [tab, setTab] = useState<ViewTab>('calendar')

	const fetchDocs = useCallback(() => {
		setLoading(true)
		client
			.fetch(QUERY)
			.then((data) => setDocs(processResults(data)))
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [client])

	useEffect(() => {
		fetchDocs()
		const interval = setInterval(fetchDocs, 60_000)
		return () => clearInterval(interval)
	}, [fetchDocs])

	const navigateToDoc = useCallback((id: string, type: string) => {
		const cleanId = id.replace('drafts.', '')
		const basePath = window.location.pathname.replace(/\/[^/]*$/, '')
		window.location.href = `${basePath}/intent/edit/id=${cleanId};type=${type}`
	}, [])

	const overdueCount = docs.filter((d) => d.status === 'overdue').length
	const scheduledCount = docs.filter((d) => d.status === 'scheduled').length
	const publishedCount = docs.filter((d) => d.status === 'published').length

	return (
		<Card
			padding={5}
			sizing="border"
			style={{ overflow: 'auto', height: '100%' }}
		>
			<Stack space={5} style={{ maxWidth: 960, margin: '0 auto' }}>
				{/* Title */}
				<Flex align="center" justify="space-between">
					<Flex align="center" gap={3}>
						<Text size={3}>
							<CalendarIcon />
						</Text>
						<Heading size={2}>Calendario editoriale</Heading>
					</Flex>

					<Flex align="center" gap={2}>
						{overdueCount > 0 && (
							<Badge tone="critical" fontSize={1}>
								{overdueCount} in ritardo
							</Badge>
						)}
						{scheduledCount > 0 && (
							<Badge tone="caution" fontSize={1}>
								{scheduledCount} programmati
							</Badge>
						)}
						<Badge tone="positive" fontSize={1}>
							{publishedCount} pubblicati
						</Badge>
					</Flex>
				</Flex>

				{/* Tabs */}
				<TabList space={1}>
					<Tab
						aria-controls="calendar-panel"
						icon={CalendarIcon}
						id="calendar-tab"
						label="Calendario"
						onClick={() => setTab('calendar')}
						selected={tab === 'calendar'}
					/>
					<Tab
						aria-controls="list-panel"
						icon={DocumentIcon}
						id="list-tab"
						label="Lista"
						onClick={() => setTab('list')}
						selected={tab === 'list'}
					/>
				</TabList>

				{/* Content */}
				{loading ? (
					<Flex align="center" justify="center" padding={6}>
						<Spinner muted />
					</Flex>
				) : docs.length === 0 ? (
					<Card padding={6} radius={2} tone="transparent" border>
						<Stack space={3} style={{ textAlign: 'center' }}>
							<Text size={3} muted>
								<CalendarIcon />
							</Text>
							<Text size={1} muted>
								Nessun contenuto trovato.
							</Text>
						</Stack>
					</Card>
				) : (
					<>
						<TabPanel
							aria-labelledby="calendar-tab"
							hidden={tab !== 'calendar'}
							id="calendar-panel"
						>
							<Box>
								<CalendarView docs={docs} onNavigate={navigateToDoc} />
							</Box>
						</TabPanel>
						<TabPanel
							aria-labelledby="list-tab"
							hidden={tab !== 'list'}
							id="list-panel"
						>
							<Box>
								<ListView docs={docs} onNavigate={navigateToDoc} />
							</Box>
						</TabPanel>
					</>
				)}
			</Stack>
		</Card>
	)
}
