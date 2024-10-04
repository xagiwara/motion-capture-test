// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  {
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'object-curly-spacing': ['warn', 'always'],
      'space-in-parens': ['warn', 'never'],
      'computed-property-spacing': ['error', 'never', { enforceForClassMembers: false }],
      indent: ['error', 2],
      'comma-dangle': ['warn', 'always-multiline'],
      quotes: ['warn', 'single', { allowTemplateLiterals: true }],
      semi: ['error', 'always'],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'vue/first-attribute-linebreak': ['warn', {
        'multiline': 'beside',
        'singleline': 'beside',
      }],
    },
  },
);
