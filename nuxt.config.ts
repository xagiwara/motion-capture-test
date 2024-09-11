// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  srcDir: 'src',
  modules: ['@nuxt/eslint'],
  nitro: {
    experimental: {
      websocket: true,
    },
  },
  runtimeConfig: {
    public: {
      mocopiDefaultPort: process.env.MOCOPI_DEFAULT_PORT || '12351',
    },
  },
});
