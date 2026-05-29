import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Configuración de pruebas del front (Vitest + Testing Library).
// Equivalente moderno a Jest (usado en proyectos previos del curso).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    env: {
      VITE_API_GATEWAY_URL: 'http://gateway.test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/**/*.test.{js,jsx}',
        'src/test/**',
        'src/assets/**',
      ],
    },
  },
})
