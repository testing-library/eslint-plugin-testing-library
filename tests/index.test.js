'use strict';

const { configs, rules } = require('../lib');
const fs = require('fs');
const path = require('path');

const rulesModules = fs.readdirSync(path.join(__dirname, '/lib/rules'));

it('should export all available rules', () => {
  const availableRules = rulesModules.map(module => module.replace('.js', ''));
  expect(Object.keys(rules)).toEqual(availableRules);
});

it.each(['recommended', 'angular', 'react', 'vue'])(
  'should export proper "%s" config',
  configName => {
    expect(configs[configName]).toMatchSnapshot();

    // make sure all enabled rules start by "testing-library/" prefix
    Object.keys(configs[configName].rules).forEach(ruleEnabled => {
      expect(ruleEnabled).toMatch(/^testing-library\/.+$/);
    });
  }
);
