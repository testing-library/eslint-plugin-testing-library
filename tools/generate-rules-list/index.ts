import rules from '../../lib/rules';
import type { TestingLibraryRuleMetaDocs } from '../../lib/utils';

import { configBadges, emojiKey, RulesList, writeRulesList } from './utils';

export const createRuleLink = (ruleName: string): string =>
  `[\`${ruleName}\`](./docs/rules/${ruleName}.md)`;

export const generateConfigBadges = (
  recommendedConfig: TestingLibraryRuleMetaDocs<unknown[]>['recommendedConfig']
): string =>
  Object.entries(recommendedConfig)
    .filter(([_, config]) => Boolean(config))
    .map(([framework]) => configBadges[framework])
    .join(' ');

const rulesList: RulesList = Object.entries(rules)
  .sort(([ruleNameA], [ruleNameB]) => ruleNameA.localeCompare(ruleNameB))
  .map(([name, rule]) => [
    createRuleLink(name),
    rule.meta.docs.description,
    Boolean(rule.meta.fixable) ? emojiKey.fixable : '',
    generateConfigBadges(rule.meta.docs.recommendedConfig),
  ]);

writeRulesList(rulesList);
