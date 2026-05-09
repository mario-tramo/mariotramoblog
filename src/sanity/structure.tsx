import { structureTool } from 'sanity/structure'
import { singleton, group, directory } from './lib/builders'
import { VscFiles, VscServerProcess } from 'react-icons/vsc'

export const structure = structureTool({
	structure: (S) =>
		S.list()
			.title('Contenuti')
			.items([
				singleton(S, 'site', 'Impostazioni sito').icon(VscServerProcess),
				S.divider(),

				S.documentTypeListItem('page').title('Tutte le pagine').icon(VscFiles),
				// personalizza le directory delle pagine
				group(S, 'Directory', [
					directory(S, 'docs', { maxLevel: 1 }).title('Documentazione'),
					directory(S, 'docs/modules').title('Documentazione › Moduli'),
				]),

				S.documentTypeListItem('global-module').title('Moduli globali'),
				S.divider(),

				S.documentTypeListItem('blog.post').title('Articoli blog'),
				S.documentTypeListItem('blog.category').title('Categorie blog'),
				S.divider(),

				S.documentTypeListItem('navigation').title('Navigazione'),
				S.documentTypeListItem('redirect').title('Redirect'),

				group(S, 'Varie', [
					S.documentTypeListItem('announcement').title('Annunci'),
					S.documentTypeListItem('person').title('Persone'),
				]),
			]),
})
