module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
  },
  overrides: [
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      env: { browser: true },
    },
    {
      files: ['apps/api/**/*.ts', 'apps/cli/**/*.ts'],
      env: { node: true },
    },
  ],
};
