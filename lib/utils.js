'use strict';

const combineQueries = (variants, methods) => {
  const combinedQueries = [];
  variants.forEach(variant => {
    const variantPrefix = variant.replace('By', '');
    methods.forEach(method => {
      combinedQueries.push(`${variantPrefix}${method}`);
    });
  });

  return combinedQueries;
};

const getDocsUrl = ruleName =>
  `https://github.com/Belco90/eslint-plugin-testing-library/tree/master/docs/rules/${ruleName}.md`;

const SYNC_QUERIES_VARIANTS = ['getBy', 'getAllBy', 'queryBy', 'queryAllBy'];
const ASYNC_QUERIES_VARIANTS = ['findBy', 'findAllBy'];
const ALL_QUERIES_VARIANTS = [
  ...SYNC_QUERIES_VARIANTS,
  ...ASYNC_QUERIES_VARIANTS,
];

const ALL_QUERIES_METHODS = [
  'ByLabelText',
  'ByPlaceholderText',
  'ByText',
  'ByAltText',
  'ByTitle',
  'ByDisplayValue',
  'ByRole',
  'ByTestId',
];

const SYNC_QUERIES_COMBINATIONS = combineQueries(
  SYNC_QUERIES_VARIANTS,
  ALL_QUERIES_METHODS
);

const ASYNC_QUERIES_COMBINATIONS = combineQueries(
  ASYNC_QUERIES_VARIANTS,
  ALL_QUERIES_METHODS
);

const ALL_QUERIES_COMBINATIONS = [
  SYNC_QUERIES_COMBINATIONS,
  ASYNC_QUERIES_COMBINATIONS,
];

module.exports = {
  getDocsUrl,
  SYNC_QUERIES_VARIANTS,
  ASYNC_QUERIES_VARIANTS,
  ALL_QUERIES_VARIANTS,
  ALL_QUERIES_METHODS,
  SYNC_QUERIES_COMBINATIONS,
  ASYNC_QUERIES_COMBINATIONS,
  ALL_QUERIES_COMBINATIONS,
};
