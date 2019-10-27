module.exports = ({ preferred, negatedPreferred, attributes }) => context => {
  function getCorrectFunctionFor(node, negated = false) {
    return (node.arguments.length === 1 ||
      node.arguments[1].value === true ||
      node.arguments[1].value === '') &&
      !negated
      ? preferred
      : negatedPreferred;
  }

  const isBannedArg = node =>
    attributes.some(attr => attr === node.arguments[0].value);

  return {
    [`CallExpression[callee.property.name=/${preferred}|${negatedPreferred}/][callee.object.property.name='not'][callee.object.object.callee.name='expect']`](
      node
    ) {
      if (negatedPreferred.startsWith('toBe')) {
        const incorrectFunction = node.callee.property.name;

        const correctFunction =
          incorrectFunction === preferred ? negatedPreferred : preferred;
        context.report({
          message: `Use ${correctFunction}() instead of not.${incorrectFunction}()`,
          node,
          fix(fixer) {
            return fixer.replaceTextRange(
              [node.callee.object.property.start, node.end],
              `${correctFunction}()`
            );
          },
        });
      }
    },
    "CallExpression[callee.property.name=/toHaveProperty|toHaveAttribute/][callee.object.property.name='not'][callee.object.object.callee.name='expect']"(
      node
    ) {
      const arg = node.arguments[0].value;
      if (isBannedArg(node)) {
        const correctFunction = getCorrectFunctionFor(node, true);

        const incorrectFunction = node.callee.property.name;
        context.report({
          message: `Use ${correctFunction}() instead of not.${incorrectFunction}('${arg}')`,
          node,
          fix(fixer) {
            return fixer.replaceTextRange(
              [node.callee.object.property.start, node.end],
              `${correctFunction}()`
            );
          },
        });
      }
    },
    "CallExpression[callee.object.callee.name='expect'][callee.property.name=/toHaveProperty|toHaveAttribute/]"(
      node
    ) {
      if (isBannedArg(node)) {
        const correctFunction = getCorrectFunctionFor(node);

        const incorrectFunction = node.callee.property.name;

        const message = `Use ${correctFunction}() instead of ${incorrectFunction}(${node.arguments
          .map(({ raw }) => raw)
          .join(', ')})`;
        context.report({
          node: node.callee.property,
          message,
          fix(fixer) {
            return [
              fixer.replaceTextRange(
                [node.callee.property.start, node.end],
                `${correctFunction}()`
              ),
            ];
          },
        });
      }
    },
  };
};
