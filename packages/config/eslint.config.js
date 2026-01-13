// @ts-check
import path from 'node:path';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import noOnlyTestsPlugin from 'eslint-plugin-no-only-tests';

export function createConfig(configFilePath) {
  const pkgDir = path.dirname(configFilePath);

  return tseslint.config(
    {
      ignores: [
        '**/dist/**',
        '**/node_modules/**',
        '**/fixture-projects/**',
        '**/fixture-project/**',
      ],
    },

    {
      files: ['**/*.ts'],
      languageOptions: {
        ecmaVersion: 2022,
        globals: { ...globals.node },
        parser: tseslint.parser,
        parserOptions: {
          projectService: true,
          tsconfigRootDir: pkgDir,
        },
      },
      plugins: {
        '@typescript-eslint': tseslint.plugin,
        'no-only-tests': noOnlyTestsPlugin,
      },
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports' },
        ],

        eqeqeq: ['error', 'always'],
        'no-var': 'error',
        'prefer-const': 'error',
        'no-debugger': 'error',

        'no-only-tests/no-only-tests': 'error',
      },
    },

    {
      files: ['**/test/**/*.ts'],
      rules: {
        '@typescript-eslint/no-floating-promises': [
          'error',
          {
            allowForKnownSafeCalls: [
              'describe',
              'it',
              'test',
              'beforeEach',
              'afterEach',
            ],
          },
        ],
      },
    }
  );
}
