module.exports = ({ preferred, negatedPreferred, attribute }) => {
  let doubleNegativeCases = [];
  if (negatedPreferred.startsWith('toBe')) {
    doubleNegativeCases = [
      {
        code: `expect(element).not.${negatedPreferred}`,
        errors: [
          {
            message: `Use ${preferred} instead of not.${negatedPreferred}`,
          },
        ],
        output: `expect(element).${preferred}`,
      },
      {
        code: `expect(element).not.${preferred}`,
        errors: [
          {
            message: `Use ${negatedPreferred} instead of not.${preferred}`,
          },
        ],
        output: `expect(element).${negatedPreferred}`,
      },
    ];
  }
  return {
    valid: [
      `expect(element).not.toHaveProperty('value', 'foo')`,
      `expect(element).${preferred}`,
      `expect(element).${negatedPreferred}`,
      `expect(element).toHaveProperty('value', 'bar')`,
    ],
    invalid: [
      ...doubleNegativeCases,
      {
        code: `expect(element).toHaveProperty('${attribute}', true)`,
        errors: [
          {
            message: `Use ${preferred} instead of toHaveProperty('${attribute}', true)`,
          },
        ],
        output: `expect(element).${preferred}`,
      },
      {
        code: `expect(element).toHaveProperty('${attribute}', false)`,
        errors: [
          {
            message: `Use ${negatedPreferred} instead of toHaveProperty('${attribute}', false)`,
          },
        ],
        output: `expect(element).${negatedPreferred}`,
      },
      {
        code: `expect(element).toHaveAttribute('${attribute}', false)`,
        errors: [
          {
            message: `Use ${negatedPreferred} instead of toHaveAttribute('${attribute}', false)`,
          },
        ],
        output: `expect(element).${negatedPreferred}`,
      },
      {
        code: `expect(element).toHaveProperty('${attribute}')`,
        errors: [
          {
            message: `Use ${preferred} instead of toHaveProperty('${attribute}')`,
          },
        ],
        output: `expect(element).${preferred}`,
      },
      {
        code: `expect(element).toHaveAttribute('${attribute}')`,
        errors: [
          {
            message: `Use ${preferred} instead of toHaveAttribute('${attribute}')`,
          },
        ],
        output: `expect(element).${preferred}`,
      },
      {
        code: `expect(element).not.toHaveAttribute('${attribute}')`,
        errors: [
          {
            message: `Use ${negatedPreferred} instead of not.toHaveAttribute('${attribute}')`,
          },
        ],
        output: `expect(element).${negatedPreferred}`,
      },
      {
        code: `expect(element).not.toHaveProperty('${attribute}')`,
        errors: [
          {
            message: `Use ${negatedPreferred} instead of not.toHaveProperty('${attribute}')`,
          },
        ],
        output: `expect(element).${negatedPreferred}`,
      },
      {
        code: `expect(element).toHaveAttribute("${attribute}", "")`,
        errors: [
          {
            message: `Use ${preferred} instead of toHaveAttribute("${attribute}", "")`,
          },
        ],
        output: `expect(element).${preferred}`,
      },
      {
        code: `expect(getByText("foo")).toHaveAttribute("${attribute}", "")`,
        errors: [
          {
            message: `Use ${preferred} instead of toHaveAttribute("${attribute}", "")`,
          },
        ],
        output: `expect(getByText("foo")).${preferred}`,
      },
      {
        code: `expect(getByText("foo")).not.toHaveProperty("${attribute}")`,
        errors: [
          {
            message: `Use ${negatedPreferred} instead of not.toHaveProperty('${attribute}')`,
          },
        ],
        output: `expect(getByText("foo")).${negatedPreferred}`,
      },
    ],
  };
};
