import { structureTool } from 'sanity/structure'
import type { StructureBuilder, ListItemBuilder } from 'sanity/structure'
import { Iframe } from 'sanity-plugin-iframe-pane'
import { singleton, group } from './lib/builders'
import { VscFiles, VscServerProcess, VscInfo, VscFileMedia, VscLaw, VscSymbolColor, VscPin } from 'react-icons/vsc'
import { PiFlowArrow } from 'react-icons/pi'
import InfoBanner from './ui/InfoBanner'

function documentTypeWithInfo(
	S: StructureBuilder,
	schemaType: string,
	title: string,
	icon: React.ComponentType,
	info: { description: string; example: string },
): ListItemBuilder {
	return S.listItem()
		.title(title)
		.icon(icon)
		.child(
			S.list()
				.title(title)
				.items([
					S.listItem()
						.id(`${schemaType}-info`)
						.title('Cos\u2019\u00e8?')
						.icon(VscInfo)
						.child(
							S.component(InfoBanner)
								.options({
									title,
									...info,
								})
								.title(title)
								.id(`${schemaType}-info-view`),
						),
					S.documentTypeListItem(schemaType).title('Gestisci'),
				]),
		)
}

function resolvePreviewUrl(doc: Record<string, unknown>): string {
	const slug = (doc?.metadata as Record<string, unknown>)?.slug as
		| Record<string, unknown>
		| undefined
	const current = slug?.current as string | undefined
	const type = doc?._type as string | undefined

	if (type === 'blog.post' && current) return `/blog/${current}`
	if (type === 'legal' && current) return `/legal/${current}`
	if (current === 'index') return '/'
	if (current) return `/${current}`
	return '/'
}

export const structure = structureTool({
	defaultDocumentNode: (S, { schemaType }) => {
		if (['page', 'blog.post', 'legal'].includes(schemaType)) {
			return S.document().views([
				S.view.form(),
				S.view
					.component(Iframe)
					.options({
						url: (doc: Record<string, unknown>) => resolvePreviewUrl(doc),
						reload: { button: true },
					})
					.title('Anteprima'),
			])
		}
		return S.document()
	},
	structure: (S) =>
		S.list()
			.title('Contenuti')
			.items([
				singleton(S, 'site', 'Impostazioni sito').icon(VscServerProcess),
				S.divider(),

				S.documentTypeListItem('page').title('Pagine').icon(VscFiles),
				S.listItem()
				.title('Articoli')
				.child(
					S.list()
						.title('Articoli')
						.items([
							S.listItem()
								.title('Tutti')
								.child(
									S.documentTypeList('blog.post').title('Tutti gli articoli'),
								),
							S.divider(),
							...[
								{ title: 'Calcio', slug: 'calcio' },
								{ title: 'Calciomercato', slug: 'calciomercato' },
								{ title: 'Fantacalcio', slug: 'fantacalcio' },
								{ title: 'Tattiche', slug: 'tattiche' },
								{ title: 'Opinioni', slug: 'opinioni' },
								{ title: 'Tennis', slug: 'tennis' },
								{ title: 'Basket', slug: 'basket' },
								{ title: 'Formula 1', slug: 'formula-1' },
							].map(({ title, slug }) =>
								S.listItem()
									.title(title)
									.child(
										S.documentList()
											.title(title)
											.filter(
												'_type == "blog.post" && $slug in categories[]->slug.current',
											)
											.params({ slug }),
									),
							),
						]),
				),
				S.documentTypeListItem('blog.category').title('Categorie'),
				group(S, 'Template', [
					documentTypeWithInfo(
						S,
						'category-template',
						'Categoria',
						VscSymbolColor,
						{
							description:
								'Il template categoria definisce il layout di default per tutte le pagine categoria. I moduli configurati qui (Lista articoli, Carosello, ecc.) vengono riutilizzati automaticamente su ogni categoria, filtrando i contenuti in base alla categoria corrente.',
							example:
								'Configuri qui un modulo "Lista articoli" e un "Carosello" → ogni pagina categoria li mostrerà automaticamente con gli articoli giusti. Se una categoria ha bisogno di un layout diverso, può sovrascrivere il template aggiungendo i propri moduli.',
						},
					),
				]),
				S.documentTypeListItem('blog.tag').title('Tag'),
				S.documentTypeListItem('legal').title('Pagine legali').icon(VscLaw),
				S.divider(),

				documentTypeWithInfo(
					S,
					'redirect',
					'Redirect',
					PiFlowArrow,
					{
						description:
							'I redirect permettono di reindirizzare automaticamente un vecchio URL verso uno nuovo. Utile quando cambi lo slug di una pagina o un articolo e non vuoi perdere il traffico dal vecchio link.',
						example:
							'/vecchio-articolo → /blog/nuovo-articolo — chi visita il vecchio URL viene portato automaticamente a quello nuovo, senza errori 404.',
					},
				),

	
				documentTypeWithInfo(
					S,
					'announcement',
					'Annunci',
					VscPin,
					{
						description:
							'Gli annunci sono banner che compaiono in cima al sito. Puoi programmarli con data di inizio e fine, e aggiungere un link. Perfetti per promozioni, avvisi importanti o novità temporanee.',
						example:
							'"Nuovo articolo: Guida tattica al 4-3-3" con link all\'articolo, visibile dal 10 maggio al 20 maggio.',
					},
				),

				S.documentTypeListItem('person').title('Autori'),
				S.divider(),

				S.documentTypeListItem('media.asset')
					.title('Media')
					.icon(VscFileMedia),
			]),
})
