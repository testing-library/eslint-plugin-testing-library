'use strict';

const { configs } = require('../lib');

describe('shareable configs', () => {
  it('should export proper "recommended" config', () => {
    expect(configs.recommended).toMatchSnapshot();
  });

  it('should export proper "angular" config', () => {
    expect(configs.angular).toMatchSnapshot();
  });

  it('should export proper "react" config', () => {
    expect(configs.react).toMatchSnapshot();
  });

  it('should export proper "vue" config', () => {
    expect(configs.vue).toMatchSnapshot();
  });
});
