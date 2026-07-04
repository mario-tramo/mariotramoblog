/**
 * Responsible-gambling notice appended to every article in the betting
 * category. Required trust signal for YMYL gambling content in Italy
 * (ADM guidelines): age restriction, risk warning, and help resources.
 */
export default function BettingDisclaimer() {
	return (
		<aside
			aria-label="Avviso sul gioco responsabile"
			className="section py-8"
		>
			<div className="mx-auto max-w-screen-md rounded border border-line bg-surface p-4 text-xs leading-relaxed text-muted">
				<p className="font-semibold">Gioco responsabile — 18+</p>
				<p>
					Il gioco con vincite in denaro è vietato ai minori di 18 anni e può
					causare dipendenza patologica. I contenuti di questa sezione hanno
					finalità puramente informative e non costituiscono incitamento al
					gioco né consulenza finanziaria. Gioca responsabilmente e solo su
					concessionari autorizzati ADM (ex AAMS). Informati sulle probabilità
					di vincita e sul regolamento del gioco su{' '}
					<a
						href="https://www.adm.gov.it"
						rel="nofollow noopener"
						target="_blank"
						className="underline"
					>
						adm.gov.it
					</a>
					. Per supporto contro la dipendenza dal gioco è attivo il numero
					verde nazionale <strong>800 558 822</strong> (TVNGA).
				</p>
			</div>
		</aside>
	)
}
