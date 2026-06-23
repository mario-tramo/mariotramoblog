declare module 'groq' {
	const groq: (strings: TemplateStringsArray | string, ...keys: unknown[]) => string
	export default groq
	export function defineQuery<const Q extends string>(query: Q): Q
}
