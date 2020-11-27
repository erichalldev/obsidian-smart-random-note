import svelte from 'rollup-plugin-svelte';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import autoPreprocess from 'svelte-preprocess';

export default {
    input: 'src/main.ts',
    output: {
        dir: 'dist',
        sourcemap: 'inline',
        format: 'cjs',
        exports: 'default',
    },
    external: ['obsidian'],
    plugins: [
        svelte({ preprocess: autoPreprocess() }),
        typescript({ sourceMap: true }),
        resolve({ browser: true, dedupe: ['svelte'] }),
        commonjs({ include: 'node_modules/**' }),
    ],
};
