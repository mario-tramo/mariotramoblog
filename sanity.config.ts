'use client'

import { defineConfig } from 'sanity'
import { projectId, dataset, apiVersion } from '@/sanity/lib/env'
import { structure } from './src/sanity/structure'
import { presentation } from './src/sanity/presentation'
import { icon } from '@/sanity/ui/Icon'
import { dashboardTool } from '@sanity/dashboard'
import { vercelWidget } from 'sanity-plugin-dashboard-widget-vercel'
import { visionTool } from '@sanity/vision'
import { codeInput } from '@sanity/code-input'
import { supportedLanguages } from '@/lib/i18n'
import { documentInternationalization } from '@sanity/document-internationalization'
import { schemaTypes } from './src/sanity/schemaTypes'
import resolveUrl from '@/lib/resolveUrl'
import { ScheduledBadge } from '@/sanity/ui/ScheduledBadge'
import { CalendarIcon } from '@sanity/icons'
import { SchedulingToolComponent } from '@/sanity/tools/SchedulingTool'
import { ScheduleAction } from '@/sanity/actions/ScheduleAction'
import { UnscheduleAction } from '@/sanity/actions/UnscheduleAction'

const singletonTypes = ['site']

export default defineConfig({
	title: 'Trm Sport Blog',
	icon,
	projectId,
	dataset,
	basePath: '/admin',

	plugins: [
		structure,
		presentation,
		dashboardTool({
			name: 'deployment',
			title: 'Deployment',
			widgets: [vercelWidget()],
		}),
		visionTool({ defaultApiVersion: apiVersion }),
		codeInput(),
		documentInternationalization({
			supportedLanguages,
			schemaTypes: ['page', 'blog.post'],
		}),
	],

	tools: [
		{
			title: 'Programmazione',
			name: 'scheduling',
			icon: CalendarIcon,
			component: SchedulingToolComponent,
		},
	],

	schema: {
		types: schemaTypes,
		templates: (templates) =>
			templates.filter(
				({ schemaType }) => !singletonTypes.includes(schemaType),
			),
	},
	document: {
		badges: (prev, { schemaType }) =>
			['blog.post', 'page', 'legal'].includes(schemaType)
				? [...prev, ScheduledBadge]
				: prev,

		productionUrl: async (prev, { document }) => {
			if (['page', 'blog.post'].includes(document?._type)) {
				return resolveUrl(document as Sanity.PageBase, { base: true })
			}
			return prev
		},

		actions: (input, { schemaType }) => {
			if (singletonTypes.includes(schemaType)) {
				return input.filter(
					({ action }) =>
						action && ['publish', 'discardChanges', 'restore'].includes(action),
				)
			}

			const schedulableTypes = ['blog.post', 'page', 'legal']
			if (schedulableTypes.includes(schemaType)) {
				return [...input, ScheduleAction, UnscheduleAction]
			}

			return input
		},
	},
})
