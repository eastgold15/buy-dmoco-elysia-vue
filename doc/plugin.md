Use components in templates as you would usually do, it will import components on demand, and there is no import and component registration required anymore! If you register the parent component asynchronously (or lazy route), the auto-imported components will be code-split along with their parent.

It will automatically turn this

<template>
  <div>
    <HelloWorld msg="Hello Vue 3.0 + Vite" />
  </div>
</template>

<script>
  export default {
    name: 'App',
  }
</script>
into this

<template>
  <div>
    <HelloWorld msg="Hello Vue 3.0 + Vite" />
  </div>
</template>

<script>
  import HelloWorld from './src/components/HelloWorld.vue'

  export default {
    name: 'App',
    components: {
      HelloWorld,
    },
  }
</script>
Note By default this plugin will import components in the src/components path. You can customize it using the dirs option.

TypeScript
To get TypeScript support for auto-imported components, there is a PR to Vue 3 extending the interface of global components. Currently, Volar has supported this usage already. If you are using Volar, you can change the config as following to get the support.

Components({
  dts: true, // enabled by default if `typescript` is installed
})
Once the setup is done, a components.d.ts will be generated and updates automatically with the type definitions. Feel free to commit it into git or not as you want.

Make sure you also add components.d.ts to your tsconfig.json under include.

Importing from UI Libraries
We have several built-in resolvers for popular UI libraries like Vuetify, Ant Design Vue, and Element Plus, where you can enable them by:

Supported Resolvers:

Ant Design Vue
Arco Design Vue
BootstrapVue
Element Plus
Element UI
Headless UI
IDux
Inkline
Ionic
Naive UI
Prime Vue
Quasar
TDesign
@tdesign-vue-next/auto-import-resolver - TDesign's own auto-import resolver
Vant
@vant/auto-import-resolver - Vant's own auto-import resolver
Varlet UI
@varlet/import-resolver - Varlet's own auto-import resolver
VEUI
View UI
Vuetify — Prefer first-party plugins when possible: v3 + vite, v3 + webpack, v2 + webpack
VueUse Components
VueUse Directives
Dev UI
import {
  AntDesignVueResolver,
  ElementPlusResolver,
  VantResolver,
} from 'unplugin-vue-components/resolvers'
// vite.config.js
import Components from 'unplugin-vue-components/vite'

// your plugin installation
Components({
  resolvers: [
    AntDesignVueResolver(),
    ElementPlusResolver(),
    VantResolver(),
  ],
})
You can also write your own resolver quickly:

Components({
  resolvers: [
    // example of importing Vant
    (componentName) => {
      // where `componentName` is always CapitalCase
      if (componentName.startsWith('Van'))
        return { name: componentName.slice(3), from: 'vant' }
    },
  ],
})
We no longer accept new resolvers.

Types for global registered components
Some libraries might register some global components for you to use anywhere (e.g. Vue Router provides <RouterLink> and <RouterView>). Since they are global available, there is no need for this plugin to import them. However, those are commonly not TypeScript friendly, and you might need to register their types manually.

Thus unplugin-vue-components provided a way to only register types for global components.

Components({
  dts: true,
  types: [{
    from: 'vue-router',
    names: ['RouterLink', 'RouterView'],
  }],
})
So the RouterLink and RouterView will be presented in components.d.ts.

By default, unplugin-vue-components detects supported libraries automatically (e.g. vue-router) when they are installed in the workspace. If you want to disable it completely, you can pass an empty array to it:

Components({
  // Disable type only registration
  types: [],
})
Migrate from vite-plugin-components
package.json

{
  "devDependencies": {
-   "vite-plugin-components": "*",
+   "unplugin-vue-components": "^0.14.0",
  }
}
vite.config.js

- import Components, { ElementPlusResolver } from 'vite-plugin-components'
+ import Components from 'unplugin-vue-components/vite'
+ import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default {
  plugins: [
    /* ... */
    Components({
      /* ... */

      // `customComponentsResolvers` has renamed to `resolver`
-     customComponentsResolvers: [
+     resolvers: [
        ElementPlusResolver(),
      ],

      // `globalComponentsDeclaration` has renamed to `dts`
-     globalComponentsDeclaration: true,
+     dts: true,

      // `customLoaderMatcher` is depreacted, use `include` instead
-     customLoaderMatcher: id => id.endsWith('.md'),
+     include: [/\.vue$/, /\.vue\?vue/, /\.vue\.[tj]sx?\?vue/, /\.md$/],
    }),
  ],
}
Configuration
The following show the default values of the configuration

Components({
  // relative paths to the directory to search for components.
  dirs: ['src/components'],

  // valid file extensions for components.
  extensions: ['vue'],

  // Glob patterns to match file names to be detected as components.
  // You can also specify multiple like this: `src/components/*.{vue,tsx}`
  // When specified, the `dirs`, `extensions`, and `directoryAsNamespace` options will be ignored.
  // If you want to exclude components being registered, use negative globs with leading `!`.
  globs: ['src/components/*.vue'],

  // search for subdirectories
  deep: true,

  // resolvers for custom components
  resolvers: [],

  // generate `components.d.ts` global declarations,
  // also accepts a path for custom filename
  // default: `true` if package typescript is installed
  dts: false,

  // Allow subdirectories as namespace prefix for components.
  directoryAsNamespace: false,

  // Collapse same prefixes (camel-sensitive) of folders and components
  // to prevent duplication inside namespaced component name.
  // works when `directoryAsNamespace: true`
  collapseSamePrefixes: false,

  // Subdirectory paths for ignoring namespace prefixes.
  // works when `directoryAsNamespace: true`
  globalNamespaces: [],

  // auto import for directives
  // default: `true` for Vue 3, `false` for Vue 2
  // Babel is needed to do the transformation for Vue 2, it's disabled by default for performance concerns.
  // To install Babel, run: `npm install -D @babel/parser`
  directives: true,

  // Transform path before resolving
  importPathTransform: v => v,

  // Allow for components to override other components with the same name
  allowOverrides: false,

  // Filters for transforming targets (components to insert the auto import)
  // Note these are NOT about including/excluding components registered - use `globs` or `excludeNames` for that
  include: [/\.vue$/, /\.vue\?vue/, /\.vue\.[tj]sx?\?vue/],
  exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/],

  // Filters for component names that will not be imported
  // Use for globally imported async components or other conflicts that the plugin cannot detect
  excludeNames: [/^Async.+/],

  // Vue version of project. It will detect automatically if not specified.
  // Acceptable value: 2 | 2.7 | 3
  version: 2.7,

  // Only provide types of components in library (registered globally)
  // see https://github.com/unplugin/unplugin-vue-components/blob/main/src/core/type-imports/index.ts
  types: [
    /* ... */
  ],
})