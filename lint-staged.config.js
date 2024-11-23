//eslint-disable-next-line @typescript-eslint/no-require-imports
const { ESLint } = require('eslint');

const removeIgnoredFiles = async (files) => {
	const eslint = new ESLint();
	const ignoredFiles = await Promise.all(
		files.map((file) => eslint.isPathIgnored(file))
	);
	const filteredFiles = files.filter((_, i) => !ignoredFiles[i]);
	return filteredFiles.join(' ');
};

module.exports = {
	'*.{js,ts}': async (files) => {
		const filesToLint = await removeIgnoredFiles(files);
		return [`eslint --max-warnings=0 ${filesToLint}`];
	},
	'*': 'prettier --write --ignore-unknown',
};
