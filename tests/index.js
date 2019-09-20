'use strict';

const { configs } = require('../lib');

describe('shareable configs', () => {
  it('should export proper "recommended" config', () => {
    expect(configs.recommended).toMatchSnapshot();
  });
});
