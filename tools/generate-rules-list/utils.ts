import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { format, resolveConfig } from 'prettier';

import {
  SUPPORTED_TESTING_FRAMEWORKS,
  SupportedTestingFramework,
} from '../../lib/utils';

const prettierConfig = resolveConfig.sync(__dirname);
const readmePath = resolve(__dirname, `../../README.md`);

export type RulesList = string[][];

export const configBadges = SUPPORTED_TESTING_FRAMEWORKS.reduce(
  (badges, framework) => ({
    ...badges,
    [framework]: `![${framework}-badge][]`,
  }),
  {}
) as Record<SupportedTestingFramework, string>;
export const emojiKey = {
  fixable: '🔧',
} as const;
const staticElements = {
  listHeaderRow: [
    'Name',
    'Description',
    emojiKey.fixable,
    'Included in configurations',
  ],
  listSpacerRow: Array(4).fill('-'),
  rulesListKey: [
    `**Key**: ${emojiKey.fixable} = fixable`,
    '',
    [
      `**Configurations**:`,
      Object.entries(configBadges)
        .map(([template, badge]) => `${badge} = ${template}`)
        .join(', '),
    ].join(' '),
  ].join('\n'),
};

const generateRulesListTable = (rulesList: RulesList) =>
  [staticElements.listHeaderRow, staticElements.listSpacerRow, ...rulesList]
    .map((column) => `|${column.join('|')}|`)
    .join('\n');

const generateRulesListMarkdown = (rulesList: RulesList) =>
  [
    '',
    staticElements.rulesListKey,
    '',
    generateRulesListTable(rulesList),
    '',
  ].join('\n');

const listBeginMarker = '<!-- RULES-LIST:START -->';
const listEndMarker = '<!-- RULES-LIST:END -->';
const overWriteRulesList = (rulesList: RulesList, readme: string) => {
  const listStartIndex = readme.indexOf(listBeginMarker);
  const listEndIndex = readme.indexOf(listEndMarker);

  if ([listStartIndex, listEndIndex].includes(-1)) {
    throw new Error(`cannot find start or end rules-list`);
  }

  return [
    readme.substring(0, listStartIndex - 1),
    listBeginMarker,
    '',
    generateRulesListMarkdown(rulesList),
    readme.substring(listEndIndex),
  ].join('\n');
};

export const writeRulesList = (rulesList: RulesList): void => {
  const readme = readFileSync(readmePath, 'utf8');
  const newReadme = format(overWriteRulesList(rulesList, readme), {
    parser: 'markdown',
    ...prettierConfig,
  });

  writeFileSync(readmePath, newReadme);
};
