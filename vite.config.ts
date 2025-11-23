import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cpSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Custom plugin to copy dist-electron to dist
const copyElectronFiles = () => {
  return {
    name: 'copy-electron-files',
    writeBundle() {
      const source = join(__dirname, 'dist-electron')
      const destination = join(__dirname, 'dist', 'dist-electron') // Copy inside dist
      if (existsSync(source)) {
        if (!existsSync(destination)) {
          mkdirSync(destination, { recursive: true })
        }
        cpSync(source, destination, { recursive: true })
        console.log('Copied dist-electron to dist/dist-electron')
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyElectronFiles()],
})
