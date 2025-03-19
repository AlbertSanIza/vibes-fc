import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
    base: '/vibes-fc',
    plugins: [tailwindcss()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three']
                }
            }
        }
    }
})
