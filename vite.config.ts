import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ CHANGE THIS to your actual repo name
const REPO_NAME = 'fizz' // if your repo is github.com/you/fizz

export default defineConfig({
  plugins: [react()],
  base: `/${REPO_NAME}/`,
  server: {
    port: 3000,
  },
})