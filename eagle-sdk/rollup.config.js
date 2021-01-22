import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

import commonjs from 'rollup-plugin-commonjs'
let isDev = process.env.NODE_ENV === 'develop'

export default {
  input: 'index.js',
  watch: {
    exclude: 'node_modules/**'
  },
  output: {
    file: isDev ? '../website/client/script/eagle-monitor/bundle.umd.js' : '../dist/bundle.umd.js',
    name: 'EagleMonitor',
    format: 'umd',
    sourcemap: true
  },
  plugins: [
    babel({
      runtimeHelpers: true,
      exclude: 'node_modules/**', // only transpile our source code
      presets: ['@babel/preset-env']
    }),
    resolve(),
    commonjs()
  ]
}
