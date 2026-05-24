import Link from 'next/link'
import { Img } from '@/ui/primitives/Img'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Authors({
	authors,
	skeleton,
	linked,
	...props
}: {
	authors?: Sanity.Person[]
	skeleton?: boolean
	linked?: boolean
} & React.ComponentProps<'ul'>) {
	if (!authors?.length && !skeleton) return null

	return (
		<ul {...props}>
			{authors?.map((author) => (
				<Author author={author} key={author._id} linked={linked} />
			))}

			{skeleton && <Author />}
		</ul>
	)
}

function Author({
	author,
	linked,
}: {
	author?: Sanity.Person
	linked?: boolean
}) {
	const props = {
		className: cn(
			'flex items-center gap-2 hover:underline',
			!linked && 'pointer-events-none',
		),
		children: (
			<>
				<span className="bg-accent/3 grid aspect-square w-[1.7em] shrink-0 place-content-center overflow-hidden rounded-full">
					{author?.image ? (
						<Img
							className="aspect-square"
							image={author.image}
							width={60}
							alt={author.name}
						/>
					) : (
						<User className="text-accent/20 size-5" aria-hidden="true" />
					)}
				</span>

				<span>{author?.name}</span>
			</>
		),
	}
	return (
		<li>
			{linked ? (
				<Link
					href={{
						pathname: '/blog',
						query: { author: author?.slug?.current },
					}}
					{...props}
				/>
			) : (
				<div {...props} />
			)}
		</li>
	)
}
