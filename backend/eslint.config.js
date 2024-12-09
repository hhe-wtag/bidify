import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';

export default [
  eslint.configs.recommended,
  {
    plugins: {
      prettier,
      import: importPlugin,
    },
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          node: true,
        },
      },
    },
    rules: {
      // Formatting
      'prettier/prettier': [
        'error',
        {
          prettierPath: './prettierrc',
        },
      ],
      // Basic Error Handling
      'no-unused-vars': 'warn',
      'no-console': [
        'warn',
        {
          allow: ['error', 'warn', 'info'],
        },
      ],

      // Import Best Practices
      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      // Basic Error Prevention
      eqeqeq: ['error', 'smart'],
      'no-return-await': 'error',
    },
  },
];
