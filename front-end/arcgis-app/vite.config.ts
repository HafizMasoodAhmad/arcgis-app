import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: { '@': path.resolve(__dirname, 'src') }
	},
	
	build: {
		minify: false,
		outDir: path.resolve(__dirname, '../../wwwroot/js/filter'), 
		emptyOutDir: true,
		watch: {
			include: 'src/**',
			exclude: 'node_modules/**'
		},
		rollupOptions: {
			external: ["vite.svg"],
			input: path.resolve(__dirname, 'src/main.tsx'),
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						return 'vendor';
					}
					return null;
				},
				entryFileNames: 'bundle_filter.js',
				assetFileNames: '[name].[ext]',
			}
		}
	}
	
})