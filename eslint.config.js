import js from '@eslint/js';
import { plugin as shadcn } from '@shadcn/lint';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'dist/',
      'public/',
      'docs/',
      '.next/',
      'app/.next/',
      '.claude/',
      '.github/',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { shadcn },
    settings: {
      shadcn: {
        note: 'See DESIGN.md for design rules and approved exceptions.',
      },
    },
    rules: {
      'shadcn/no-restyle': [
        'error',
        {
          allow: ['layout'],
          contracts: [{ pattern: '^SidebarMenuButton$', allow: ['layout', 'text-kumo-*'] }],
        },
      ],
      'shadcn/no-raw-colors': 'error',
      'shadcn/no-arbitrary-values': 'error',
      'shadcn/no-inline-styles': 'error',
      'shadcn/no-unknown-classes': ['error', { allow: ['rdp-*', 'keeper-ignore'] }],
      'shadcn/require-static-classes': 'error',
    },
  },
  {
    // Repo scripts run under Node, and the browser-driving ones also evaluate
    // callbacks in the page context.
    files: ['**/scripts/**/*.{js,mjs,ts}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        AbortSignal: 'readonly',
        setTimeout: 'readonly',
        document: 'readonly',
      },
    },
  },
  {
    files: ['packages/registry/src/components/**', 'app/components/ui/**'],
    rules: {
      'shadcn/no-restyle': 'off',
      'shadcn/no-raw-colors': 'off',
      'shadcn/no-arbitrary-values': 'off',
      'shadcn/no-inline-styles': 'off',
      'shadcn/require-static-classes': 'off',
    },
  },
  {
    files: ['packages/registry/**'],
    rules: {
      'shadcn/no-unknown-classes': 'off',
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['packages/registry/src/components/**/*.{ts,tsx}', 'app/components/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
);
