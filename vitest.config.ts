import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**\/*.{test,spec}.?(c|m)[t]s?(x)'],
    globals: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['json-summary', 'json', 'html']
    }
  }
})
