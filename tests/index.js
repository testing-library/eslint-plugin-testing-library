'use strict';

const { configs } = require('../lib');

describe('shareable configs', () => {
  it.each(['recommended', 'angular', 'react', 'vue'])(
    'should export proper "%s" config',
    configName => {
      expect(configs[configName]).toMatchSnapshot();
    }
  );
});
