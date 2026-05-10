import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
	return (
		<section className="relative flex min-h-[calc(100svh-var(--header-height))] items-center justify-center overflow-hidden bg-canvas">
			<div className="section relative z-10 flex flex-col items-center gap-8 py-20 lg:flex-row lg:gap-16">
				{/* Left: 404 background image */}
				<div className="relative flex-1">
					<Image
						src="/images/404_background.png"
						alt="404"
						width={800}
						height={500}
						className="w-full max-w-[600px] object-contain"
						priority
					/>
				</div>

				{/* Right: Message */}
				<div className="flex-1 text-center lg:text-left">
					<h2 className="h2 mb-4">
						<span className="text-accent">Oops!</span> Page not found.
					</h2>
					<p className="mb-8 max-w-md text-muted">
						Looks like you&apos;ve gone offside.
						<br />
						The page you&apos;re looking for doesn&apos;t exist
						<br />
						or has been moved.
					</p>
					<Link href="/" className="action">
						Back to Homepage
					</Link>
				</div>
			</div>
		</section>
	)
}
