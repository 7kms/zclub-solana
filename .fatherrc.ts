import { defineConfig } from 'father';

export default defineConfig({
  esm: {
    transformer: 'babel',
   
  },
  cjs: { transformer: 'babel' },
  platform: 'node',
  extraBabelPlugins:[
    ['transform-remove-console', { 'exclude': ['error', 'warn'] }]
  ]
});