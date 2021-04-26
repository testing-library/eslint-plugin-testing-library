export const SUPPORTED_TESTING_FRAMEWORKS = [
  'dom',
  'angular',
  'react',
  'vue',
] as const;
export type SupportedTestingFramework = typeof SUPPORTED_TESTING_FRAMEWORKS[number];
