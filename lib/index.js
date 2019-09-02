'use strict';
const path = require('path');
const requireIndex = require('requireindex');

const rules = requireIndex(path.join(__dirname, '/rules'));

module.exports = {
  rules,
};
