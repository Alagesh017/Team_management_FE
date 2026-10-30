import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

function desktopBrandingPlugin() {
	const iconSrc = path.resolve('desktop/image.png')
	return {
		name: 'desktop-branding',
		transformIndexHtml(html) {
			return html
				.replace(/<title>[^<]*<\/title>/, '<title>Dce task manager</title>')
				.replace(/href="\/taskmanagement\/favicon\.png"/g, 'href="./app-icon.png"')
				.replace(/href="\/taskmanagement\/icon\.png"/g, 'href="./app-icon.png"')
		},
		closeBundle() {
			if (!fs.existsSync(iconSrc)) return
			const outDir = path.resolve('dist-desktop')
			fs.copyFileSync(iconSrc, path.join(outDir, 'app-icon.png'))
			fs.copyFileSync(iconSrc, path.join(outDir, 'favicon.png'))
		},
	}
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const isDesktop = mode === 'desktop'

	return {
		plugins: [react(), tailwindcss(), ...(isDesktop ? [desktopBrandingPlugin()] : [])],
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
