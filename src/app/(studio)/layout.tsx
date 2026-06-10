export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<head>
				<style
					dangerouslySetInnerHTML={{
						__html: `
							[data-scheme="dark"] .pt-editable {
								background: #131820 !important;
								border-radius: 4px;
							}
							[data-scheme="light"] .pt-editable {
								background: #f0f4f8 !important;
								border-radius: 4px;
							}
						`,
					}}
				/>
			</head>
			<body style={{ margin: 0 }}>{children}</body>
		</html>
	)
}
