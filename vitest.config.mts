import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['**/tests/**/*.test.ts'],
		setupFiles: ['./vitest.setup.mts'],
		coverage: {
			thresholds: {
				branches: 90,
				functions: 90,
				lines: 90,
				statements: 90,
			},
		},
	},
});
