import { HiOutlineMenuAlt3 } from 'react-icons/hi'
import { IoClose } from 'react-icons/io5'

export default function Toggle() {
	return (
		<label className="[grid-area:toggle] md:hidden" aria-label="Apri o chiudi il menu di navigazione">
			<input id="header-toggle" type="checkbox" hidden />

			<span className="header-open:hidden text-white/60" aria-hidden="true">
				<HiOutlineMenuAlt3 className="size-6" />
			</span>
			<span className="header-closed:hidden text-white/60" aria-hidden="true">
				<IoClose className="size-6" />
			</span>
		</label>
	)
}
