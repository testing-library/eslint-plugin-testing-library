import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['**/tests/**/*.test.ts'],
		setupFiles: ['./vitest.setup.mts'],
		coverage: {
			include: ['lib/**'],
			thresholds: {
				branches: 90,
				functions: 90,
				lines: 90,
				statements: 90,
			},
		},
	},
});
