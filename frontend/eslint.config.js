import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'docs'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Context Provider와 같은 파일에 두는 사용 hook은 허용
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true, allowExportNames: ['useProfile', 'useLoginGate'] },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // 다른 타입을 그대로 받는 Props(`interface A extends B {}`)는 허용
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'no-console': 'warn',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      // named export만 사용한다. 모듈 진입점(Root.tsx)만 lazy import 때문에 default export 허용
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'export default 대신 named export를 사용합니다. (CODE_CONVENTION 4장)',
        },
      ],
    },
  },
  {
    // 앱 진입점은 export가 없음
    files: ['src/main.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['src/apps/*/Root.tsx'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['*.{js,ts}', 'src/apps/*/tailwind.config.js'],
    languageOptions: { globals: globals.node },
  },
);
