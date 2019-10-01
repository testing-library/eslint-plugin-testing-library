'use strict';

const { configs, rules } = require('../lib');
const fs = require('fs');
const path = require('path');

const rulesModules = fs.readdirSync(path.join(__dirname, '/lib/rules'));

it('should export proper rules', () => {
  const availableRules = rulesModules.map(module => module.replace('.js', ''));
  expect(Object.keys(rules)).toEqual(availableRules);
});

it.each(['recommended', 'angular', 'react', 'vue'])(
  'should export proper "%s" config',
  configName => {
    expect(configs[configName]).toMatchSnapshot();
  }
);
