// Copied from https://github.com/babel/babel/blob/b35c78f08dd854b08575fc66ebca323fdbc59dab/packages/babel-helpers/src/helpers.js#L615-L619
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const interopRequireDefault = <T extends unknown>(obj: any): { default: T } =>
  obj?.__esModule ? obj : { default: obj };

export const importDefault = <T extends unknown>(moduleName: string): T =>
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  interopRequireDefault<T>(require(moduleName)).default;
