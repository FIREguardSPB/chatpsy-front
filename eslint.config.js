// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

// @ts-check
import { fileURLToPath } from 'url';
import path from 'path';

import prettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import reactRefresh from 'eslint-plugin-react-refresh';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [// Global ignores
{
  ignores: ['dist/**', 'node_modules/**'],
}, // Base config for all files
{
  files: ['**/*.{js,jsx,ts,tsx}'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      ...globals.browser,
      ...globals.es2020,
    },
    parser: typescriptParser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      project: './tsconfig.eslint.json',
      tsconfigRootDir: __dirname,
    },
  },
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
    'jsx-a11y': jsxA11yPlugin,
    import: importPlugin,
    'react-refresh': reactRefresh,
    '@typescript-eslint': typescriptPlugin,
    'unused-imports': unusedImports,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React
    'react/react-in-jsx-scope': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/require-default-props': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
    
    // TypeScript
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/indent': 'off', // Let Prettier handle indentation
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    
    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Imports
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.{js,jsx,ts,tsx}',
          '**/*.spec.{js,jsx,ts,tsx}',
          '**/*.stories.{js,jsx,ts,tsx}',
          '**/vite.config.{js,ts}',
          '**/eslint.config.js',
        ],
      },
    ],
    
    // Other rules
    'no-shadow': 'off',
    'no-use-before-define': 'off',
    'arrow-parens': 'off',
    'no-await-in-loop': 'off',
    'class-methods-use-this': 'off',
    'func-names': 'off',
    'implicit-arrow-linebreak': 'off',
    'import/no-mutable-exports': 'off',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index'],
        'newlines-between': 'always-and-inside-groups',
      },
    ],
    'import/prefer-default-export': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'max-len': ['warn', { code: 150, ignoreUrls: true }],
    'no-async-promise-executor': 'off',
    'no-console': 'off',
    'no-debugger': 'error',
    'no-empty-interface': 'off',
    'no-param-reassign': 'off',
    'no-restricted-globals': 'off',
    'no-undef': 'off',
    'object-curly-newline': 'off',
    'operator-linebreak': 'off',
    'prefer-destructuring': 'off',
    'react/destructuring-assignment': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-no-bind': 'off',
    'react/no-unused-prop-types': 'off',
    'react/jsx-indent': 'off',
    'react/jsx-indent-props': 'off',
    'react/jsx-tag-spacing': 'off',
    'react/jsx-wrap-multilines': 'off',
    'react/prefer-stateless-function': 'off',
    'react/prop-types': 'off',
    'react/static-property-placement': 'off',
    'jsx-a11y/label-has-associated-control': ['warn', {
      labelComponents: ['label'],
      labelAttributes: ['htmlFor'],
      controlComponents: ['input'],
    }],
    'spaced-comment': ['warn', 'always', {
      line: {
        markers: ['/', '#region'],
        exceptions: ['#endregion'],
      },
    }],
    'unused-imports/no-unused-imports': 'warn',
    'object-curly-spacing': ['warn', 'always'],
  },
}, // Prettier config (must come last to override other configs)
{
  ...prettier,
  rules: {
    ...prettier.rules,
    // Add any Prettier rules you want to override
  },
}, ...storybook.configs["flat/recommended"]];
