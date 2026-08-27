import { fileURLToPath, URL } from 'node:url'

import { defineConfig, PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import { AntDesignResolver } from './build/resolvers/antd'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        AutoImport({
            // targets to transform
            include: [
                /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
                /\.md$/ // .md
            ],
            // global imports to register
            imports: [
                'react',
                'react-router',
                {
                    react: ['Suspense', 'createContext'],
                    'react-router': [
                        'NavLink',
                        'Navigate',
                        'Outlet',
                        'RouterProvider',
                        'createBrowserRouter',
                        'useBlocker',
                        'useMatches',
                        'useSearchParams'
                    ],
                    antd: ['message', 'notification']
                },
                {
                    from: 'react',
                    imports: ['ReactNode'],
                    type: true
                },
                {
                    from: 'react-router',
                    imports: ['RouteObject'],
                    type: true
                }
            ],

            // Filepath to generate corresponding .d.ts file.
            // Defaults to './auto-imports.d.ts' when `typescript` is installed locally.
            // Set `false` to disable.
            dts: './auto-imports.d.ts',
            // Custom resolvers, compatible with `unplugin-vue-components`
            // see https://github.com/antfu/unplugin-auto-import/pull/23/
            resolvers: [
                IconsResolver({
                    prefix: 'icon',
                    extension: 'jsx',
                    customCollections: ['console']
                }),
                AntDesignResolver({
                    resolveIcons: true
                })
            ],
            // Generate corresponding .eslintrc-auto-import.json file.
            // eslint globals Docs - https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals
            eslintrc: {
                enabled: true, // Default `false`
                filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
                globalsPropValue: true // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
            }
        }) as PluginOption,
        Icons({
            compiler: 'jsx',
            jsx: 'react',
            autoInstall: true,
            customCollections: {
                console: FileSystemIconLoader('src/assets/svg', (svg) =>
                    svg.replace(/^svg /, '<svg fill="currentColor"')
                )
            }
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    }
})
