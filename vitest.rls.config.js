import { defineConfig } from 'vitest/config'

// Separate from vitest.config.js: this suite hits the real live Supabase
// project over the network (no mocking, no jsdom) to exercise actual RLS
// policies, so it must never run as part of the default `npm test`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['rls/**/*.test.js'],
    fileParallelism: false,
  },
})
