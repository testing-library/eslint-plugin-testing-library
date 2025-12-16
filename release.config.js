/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
	branches: [
		'+([0-9])?(.{+([0-9]),x}).x',
		'main',
		'next',
		'next-major',
		{
			name: 'beta',
			prerelease: true,
		},
		{
			name: 'alpha',
			prerelease: true,
		},
	],
};
