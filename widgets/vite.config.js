// vite.config.js - configuration of vite to build the module in this directory with all
// the widgets in local .vue files.
// The resulting build ends up in ./dist and is only used by Node-RED-flexdash in production
// mode. The built module is loaded into FlexDash in the browser by the palette loader causing
// the widgets to be usable in dashboards.
// This config has two primary tricks: the first is to generate only an ESM build, because that's
// what FlexDash expects. The second is to use viteExternalsPlugin to declare that vue, vuetify and
// uPlot are not to be included in the bundle. Instead, they are already loaded by FlexDash itself
// and where the local module uses these libraries the generated bundle uses global variables
// to access them.

import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import { viteExternalsPlugin } from 'vite-plugin-externals'

module.exports = defineConfig({
  plugins: [
    vue(),
    viteExternalsPlugin({
      vue: 'Vue',
      vuetify: 'Vuetify',
      uplot: 'uplot',
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild', // doesn't work !@#$%^&
    lib: {
      entry: resolve(__dirname, 'index.js'),
      formats: ['es'],
      fileName: (format) => `fd-widgets.${format}.js`
    },
    // rollupOptions: {
    //   // vue is provided by FlexDash, for Vuetify use window.Vuetify, for uPlot use window.uPlot
    //   external: ['vue'],
    //   output: { paths: { vue: './vue.esm-browser.prod.js' } },
    // }
  }
})
