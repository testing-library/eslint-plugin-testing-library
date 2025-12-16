import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['**/tests/**/*.test.ts'],
		setupFiles: ['./vitest.setup.ts'],
		clearMocks: true,
		coverage: {
			include: ['src/**'],
			thresholds: {
				branches: 90,
				functions: 90,
				lines: 90,
				statements: 90,
			},
		},
		// Enable JUnit reporter in CI environment
		reporters: process.env.CI ? ['default', 'junit'] : configDefaults.reporters,
		outputFile: {
			junit: 'test-report.junit.xml',
		},
	},
});
