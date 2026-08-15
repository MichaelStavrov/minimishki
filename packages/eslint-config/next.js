import nextConfig from 'eslint-config-next/core-web-vitals';
import prettierConfig from 'eslint-config-prettier/flat';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import base from './base.js';

/**
 * Слои FSD сверху вниз. Каждый слой видит только те, что ниже него.
 * Раскладка — в .Codex/plans/02-structure.md
 */
const layers = ['_app', '_pages', 'widgets', 'features', 'entities', 'shared'];

/**
 * Зоны для import/no-restricted-paths: для каждого слоя запрещаем импорт
 * из всех вышележащих. Шесть слоёв дают 15 пар.
 */
const fsdZones = layers.flatMap((layer, index) =>
  layers.slice(0, index).map((upperLayer) => ({
    target: `./src/${layer}`,
    from: `./src/${upperLayer}`,
    message: `Слой «${layer}» не может импортировать из вышележащего слоя «${upperLayer}»: зависимости в FSD идут только сверху вниз.`,
  })),
);

/** Порядок импортов внутри группы internal — по слоям, сверху вниз. */
const fsdPathGroups = layers.map((layer) => ({
  pattern: `@/${layer}/**`,
  group: 'internal',
  position: 'after',
}));

export default tseslint.config(
  ...base,
  ...nextConfig,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'import/no-restricted-paths': ['error', { zones: fsdZones }],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: fsdPathGroups,
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
        },
      ],
    },
  },

  prettierConfig,
);
