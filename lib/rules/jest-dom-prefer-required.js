/**
 * @fileoverview prefer toBeDisabled or toBeEnabled over attribute checks
 * @author Ben Monro
 */
'use strict';

const createBannedAttributeRule = require('../createBannedAttributeRule');
const { getDocsUrl } = require('../utils');

module.exports = {
  meta: {
    docs: {
      description:
        'prefer toBeDisabled or toBeEnabled over checking properties',
      category: 'jest-dom',
      recommended: false,
      url: getDocsUrl('jest-dom-prefer-required'),
    },
    fixable: 'code',
  },

  create: createBannedAttributeRule({
    preferred: 'toBeRequired',
    negatedPreferred: 'not.toBeRequired',
    attributes: ['required', 'aria-required'],
  }),
};
