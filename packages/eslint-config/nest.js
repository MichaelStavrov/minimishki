import prettierConfig from 'eslint-config-prettier/flat';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import base from './base.js';

export default tseslint.config(
  ...base,

  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // Не включать: `import type` для внедряемых классов стирает импорт,
      // emitDecoratorMetadata теряет ссылку на класс — DI Nest падает в рантайме.
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },

  {
    files: ['prisma/seed.ts'],
    rules: { 'no-console': 'off' },
  },

  prettierConfig,
);
