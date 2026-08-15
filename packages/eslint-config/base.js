import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Общая основа для всех приложений монорепозитория.
 * Надстройки — в next.js (фронтенд, зоны FSD) и nest.js (бэкенд).
 *
 * eslint-config-prettier здесь намеренно нет: он должен идти последним,
 * поэтому его подключают next.js и nest.js в конце своих цепочек.
 */
export default tseslint.config(
  {
    ignores: ['dist/**', 'build/**', '.next/**', 'coverage/**', 'next-env.d.ts'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        // Строит полную программу TypeScript. Без неё не работают type-aware
        // правила — ради них всё и затевалось: забытый await в сервисе Nest
        // молча теряет запись в БД, а контроллер отдаёт 201.
        projectService: true,
        // Папка проверяемого приложения, а не пакета конфигов: import.meta.dirname
        // указывал бы на packages/eslint-config/. Следствие — eslint запускается
        // из папки приложения, именно так его вызывает turbo run lint.
        tsconfigRootDir: process.cwd(),
      },
    },
    settings: {
      // Без TS-резолвера import/no-restricted-paths молча бездействует: неразрешённые
      // импорты правило пропускает, а стандартный резолвер не находит .ts без расширения.
      // Проверено на заведомом нарушении FSD — линтер отчитывался «0 проблем».
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Префикс _ — пометка «намеренно не используется». Нужен, в частности,
      // для проверок совпадения перечислений в apps/api/src/common/enum-parity.ts.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    // Конфиги и скрипты на чистом JavaScript в программу TypeScript не входят,
    // и type-aware правила на них падают с ошибкой парсера — отключаем точечно.
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);
