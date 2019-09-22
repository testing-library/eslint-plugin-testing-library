'use strict';

const { configs, rules } = require('../lib');

it('should export proper rules', () => {
  expect(Object.keys(rules)).toMatchSnapshot();
});

it.each(['recommended', 'angular', 'react', 'vue'])(
  'should export proper "%s" config',
  configName => {
    expect(configs[configName]).toMatchSnapshot();
  }
);
