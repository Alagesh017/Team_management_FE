import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const isDesktop = mode === 'desktop'

	return {
		plugins: [react(), tailwindcss()],
		base: isDesktop ? './' : '/taskmanagement/',
		build: isDesktop
			? {
					outDir: 'dist-desktop',
					emptyOutDir: true,
				}
			: undefined,
		server: {
			historyApiFallback: {
				index: '/taskmanagement/index.html',
			},
		},
	}
})
