// Copied from https://github.com/babel/babel/blob/b35c78f08dd854b08575fc66ebca323fdbc59dab/packages/babel-helpers/src/helpers.js#L615-L619
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const interopRequireDefault = <T>(obj: any): { default: T } =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-return
	obj?.__esModule ? obj : { default: obj };

export const importDefault = <T>(moduleName: string): T =>
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	interopRequireDefault<T>(require(moduleName)).default;
