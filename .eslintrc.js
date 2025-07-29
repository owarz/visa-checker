module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  rules: {
    // Burada projenize özel kuralları etkinleştirebilir veya devre dışı bırakabilirsiniz.
    // Örnek:
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': 'warn', // Geliştirme sırasında yararlı olabilir, ancak production'da olmamalı
  },
  ignorePatterns: ['.eslintrc.js', 'dist', 'node_modules'],
};
