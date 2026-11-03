import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

function resolveDesktopIcon() {
	const candidates = [
		path.join(projectRoot, 'desktop', 'image.png'),
		path.join(projectRoot, 'public', 'icon.png'),
		path.join(projectRoot, 'public', 'favicon.png'),
	]
	return candidates.find((p) => fs.existsSync(p)) ?? null
}

function desktopBrandingPlugin() {
	return {
		name: 'desktop-branding',
		transformIndexHtml(html) {
			return html
				.replace(/<title>[^<]*<\/title>/, '<title>Dce task manager</title>')
				.replace(/href="\/taskmanagement\/favicon\.png"/g, 'href="./app-icon.png"')
				.replace(/href="\/taskmanagement\/icon\.png"/g, 'href="./app-icon.png"')
		},
		writeBundle(options) {
			const iconSrc = resolveDesktopIcon()
			if (!iconSrc) {
				console.warn('[desktop-branding] No icon found (desktop/image.png or public/icon.png)')
				return
			}
			const outDir = options.dir ? path.resolve(options.dir) : path.join(projectRoot, 'dist-desktop')
			fs.mkdirSync(outDir, { recursive: true })
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
