import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const REPO_NAME = 'fizz'  // ← must match GitHub repo name

export default defineConfig({
  plugins: [react()],
  base: `/${REPO_NAME}/`,
  server: { port: 3000 },
})