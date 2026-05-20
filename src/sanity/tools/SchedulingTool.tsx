'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
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
} from '@sanity/icons'

// ——— Types ———

interface ScheduledDoc {
	_id: string
	_type: string
	title: string
	publishAt: string
}

type ViewTab = 'calendar' | 'list'

// ——— Helpers ———

const TYPE_LABELS: Record<string, string> = {
	'blog.post': 'Articolo',
	page: 'Pagina',
	legal: 'Legale',
}

function docTitle(doc: ScheduledDoc) {
	return doc.title || doc._id.replace('drafts.', '')
}

function isOverdue(publishAt: string) {
	return new Date(publishAt) <= new Date()
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

const QUERY = `*[
  _id in path("drafts.**") &&
  defined(publishAt)
]{
  _id,
  _type,
  publishAt,
  "title": coalesce(metadata.title, title, _id)
} | order(publishAt asc)`

// ——— Components ———

function CalendarView({ docs }: { docs: ScheduledDoc[] }) {
	const today = new Date()
	const [year, setYear] = useState(today.getFullYear())
	const [month, setMonth] = useState(today.getMonth())

	const daysInMonth = getDaysInMonth(year, month)
	const firstDay = getFirstDayOfWeek(year, month)

	const docsInMonth = useMemo(
		() =>
			docs.filter((d) => {
				const dt = new Date(d.publishAt)
				return dt.getFullYear() === year && dt.getMonth() === month
			}),
		[docs, year, month],
	)

	function docsForDay(day: number) {
		const target = new Date(year, month, day)
		return docsInMonth.filter((d) => isSameDay(new Date(d.publishAt), target))
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

	const cells: (number | null)[] = [
		...Array(firstDay).fill(null),
		...Array.from({ length: daysInMonth }, (_, i) => i + 1),
	]
	// Pad to full weeks
	while (cells.length % 7 !== 0) cells.push(null)

	return (
		<Stack space={4}>
			{/* Header */}
			<Flex align="center" justify="space-between">
				<Button
					icon={ChevronLeftIcon}
					mode="bleed"
					onClick={prevMonth}
					aria-label="Mese precedente"
				/>
				<Heading size={1}>
					{MONTH_NAMES[month]} {year}
				</Heading>
				<Button
					icon={ChevronRightIcon}
					mode="bleed"
					onClick={nextMonth}
					aria-label="Mese successivo"
				/>
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
						return <Card key={`empty-${i}`} padding={2} />
					}

					const dayDocs = docsForDay(day)
					const isToday = isSameDay(
						new Date(year, month, day),
						today,
					)

					return (
						<Card
							key={day}
							padding={2}
							radius={2}
							tone={isToday ? 'primary' : 'default'}
							border
							style={{ minHeight: 64 }}
						>
							<Stack space={2}>
								<Text
									size={0}
									weight={isToday ? 'bold' : 'regular'}
								>
									{day}
								</Text>
								{dayDocs.map((doc) => (
									<Card
										key={doc._id}
										padding={1}
										radius={2}
										tone={
											isOverdue(doc.publishAt)
												? 'critical'
												: 'caution'
										}
									>
										<Text
											size={0}
											textOverflow="ellipsis"
											style={{
												whiteSpace: 'nowrap',
												overflow: 'hidden',
											}}
										>
											{docTitle(doc)}
										</Text>
									</Card>
								))}
							</Stack>
						</Card>
					)
				})}
			</Grid>
		</Stack>
	)
}

function ListView({ docs }: { docs: ScheduledDoc[] }) {
	const overdue = docs.filter((d) => isOverdue(d.publishAt))
	const upcoming = docs.filter((d) => !isOverdue(d.publishAt))

	return (
		<Stack space={5}>
			{overdue.length > 0 && (
				<Stack space={3}>
					<Flex align="center" gap={2}>
						<Text size={1}>
							<WarningOutlineIcon />
						</Text>
						<Heading size={0}>
							In ritardo ({overdue.length})
						</Heading>
					</Flex>
					{overdue.map((doc) => (
						<DocRow key={doc._id} doc={doc} />
					))}
				</Stack>
			)}

			<Stack space={3}>
				<Flex align="center" gap={2}>
					<Text size={1}>
						<ClockIcon />
					</Text>
					<Heading size={0}>
						Programmati ({upcoming.length})
					</Heading>
				</Flex>
				{upcoming.length === 0 ? (
					<Card padding={4} radius={2} tone="transparent">
						<Text size={1} muted align="center">
							Nessun contenuto programmato
						</Text>
					</Card>
				) : (
					upcoming.map((doc) => (
						<DocRow key={doc._id} doc={doc} />
					))
				)}
			</Stack>
		</Stack>
	)
}

function DocRow({ doc }: { doc: ScheduledDoc }) {
	const overdue = isOverdue(doc.publishAt)

	return (
		<Card padding={3} radius={2} border tone={overdue ? 'critical' : 'default'}>
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
							{formatDateTime(doc.publishAt)}
						</Text>
					</Stack>
				</Flex>

				<Flex align="center" gap={2} style={{ flexShrink: 0 }}>
					<Badge
						tone={overdue ? 'critical' : 'caution'}
						fontSize={0}
					>
						{TYPE_LABELS[doc._type] || doc._type}
					</Badge>
					<Badge
						tone={overdue ? 'critical' : 'primary'}
						fontSize={0}
					>
						{overdue ? 'In ritardo' : 'Programmato'}
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
			.then(setDocs)
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [client])

	useEffect(() => {
		fetchDocs()
		// Refresh every 60 seconds
		const interval = setInterval(fetchDocs, 60_000)
		return () => clearInterval(interval)
	}, [fetchDocs])

	const overdueCount = docs.filter((d) => isOverdue(d.publishAt)).length

	return (
		<Card padding={5} sizing="border" style={{ overflow: 'auto', height: '100%' }}>
			<Stack space={5} style={{ maxWidth: 960, margin: '0 auto' }}>
				{/* Title */}
				<Flex align="center" justify="space-between">
					<Flex align="center" gap={3}>
						<Text size={3}>
							<CalendarIcon />
						</Text>
						<Heading size={2}>Pubblicazioni programmate</Heading>
					</Flex>

					<Flex align="center" gap={3}>
						{overdueCount > 0 && (
							<Badge tone="critical" fontSize={1}>
								{overdueCount} in ritardo
							</Badge>
						)}
						<Badge tone="primary" fontSize={1}>
							{docs.length} totali
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
								Nessun contenuto programmato.
							</Text>
							<Text size={1} muted>
								Imposta il campo &quot;Pubblicazione programmata&quot; in un
								documento per vederlo qui.
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
								<CalendarView docs={docs} />
							</Box>
						</TabPanel>
						<TabPanel
							aria-labelledby="list-tab"
							hidden={tab !== 'list'}
							id="list-panel"
						>
							<Box>
								<ListView docs={docs} />
							</Box>
						</TabPanel>
					</>
				)}
			</Stack>
		</Card>
	)
}
