import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

const compatibleReactConfig = nx.configs['flat/react'].filter((config) => {
  const rules = Object.keys(config.rules ?? {});

  return !rules.some(
    (rule) => rule.startsWith('react/') || rule.startsWith('jsx-a11y/'),
  );
});

export default [
  ...compatibleReactConfig,
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
];
