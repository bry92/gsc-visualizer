import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isUserOrOrgPagesRepo = repositoryName?.toLowerCase().endsWith('.github.io')
const githubPagesBase =
  repositoryName && !isUserOrOrgPagesRepo ? `/${repositoryName}/` : '/'
const appBase = process.env.VITE_BASE_PATH ?? (process.env.GITHUB_ACTIONS ? githubPagesBase : '/')

// https://vite.dev/config/
export default defineConfig({
  base: appBase,
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            'lucide-react',
          ],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['gsap', '@gsap/react'],
        },
      },
    },
  },
});
