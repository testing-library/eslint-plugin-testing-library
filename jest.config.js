module.exports = {
	testMatch: ['**/tests/**/*.test.ts'],
	transform: {
		'^.+\\.ts$': '@swc/jest',
	},
	coverageThreshold: {
		global: {
			branches: 90,
			functions: 90,
			lines: 90,
			statements: 90,
		},
	},
};
