// ESLint v9 flat config — https://eslint.org/docs/latest/use/configure/configuration-files
//
// Includes `typescript-eslint` for parser + TS-aware rules so that the lint
// pipeline runs over the whole codebase (not just JS-flavored files).

import tseslint from 'typescript-eslint'

export default tseslint.config(
	{
	ignores: [
		'.next/**',
		'node_modules/**',
		'out/**',
		'build/**',
		'public/**',
		'src/sanity/.sanity/**',
		'scripts/**',
		'claude-seo/**', // vendored plugin (separate build, not part of app)
		'**/*.test.ts', // tests run via `node:test` runner, not app code
	],
	},

	// JavaScript flavored files
	...tseslint.configs.recommended,
	{
		files: ['**/*.{js,mjs,cjs,jsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: { jsx: true },
			},
			globals: {
				document: 'readonly',
				window: 'readonly',
				navigator: 'readonly',
				localStorage: 'readonly',
				sessionStorage: 'readonly',
				fetch: 'readonly',
				FormData: 'readonly',
				Headers: 'readonly',
				Request: 'readonly',
				Response: 'readonly',
				URL: 'readonly',
				URLSearchParams: 'readonly',
				atob: 'readonly',
				btoa: 'readonly',
				IntersectionObserver: 'readonly',
				MutationObserver: 'readonly',
				HTMLElement: 'readonly',
				HTMLDivElement: 'readonly',
				HTMLButtonElement: 'readonly',
				HTMLInputElement: 'readonly',
				HTMLUListElement: 'readonly',
				HTMLAnchorElement: 'readonly',
				KeyboardEvent: 'readonly',
				PointerEvent: 'readonly',
				ReactNode: 'readonly',
				ReactElement: 'readonly',
				ComponentProps: 'readonly',
				process: 'readonly',
				Buffer: 'readonly',
				console: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				queueMicrotask: 'readonly',
				globalThis: 'readonly',
				NodeJS: 'readonly',
				React: 'readonly',
				Sanity: 'readonly',
			},
		},
		rules: {
			'no-unused-vars': 'off', // handled by @typescript-eslint/no-unused-vars
			eqeqeq: ['error', 'smart'],
			'no-console': 'off', // app uses structured console logging
		},
	},

	// TypeScript flavored files
	{
		files: ['**/*.{ts,tsx}'],
		extends: [...tseslint.configs.recommended],
		rules: {
			// Common tweaks for a Next.js / Sanity codebase
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-non-null-assertion': 'off', // pragmatic
			eqeqeq: ['error', 'smart'],
			'no-console': 'off',
		},
	},
)
