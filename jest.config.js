module.exports = {
	roots: ['<rootDir>/tests/'],
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
