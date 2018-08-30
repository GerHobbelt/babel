# Woah, what's going on here?

A monorepo, muhahahahahaha. See the [monorepo design doc](/doc/design/monorepo.md) for reasoning.

- [Core Packages](#core-packages)
- [Other](#other)
- [Presets](#presets)
- [Plugins](#plugins)
  - [Transform Plugins](#transform-plugins)
  - [Syntax Plugins](#syntax-plugins)

### Core Packages

| Package | Version | Dependencies |
|--------|-------|------------|
| [`@gerhobbelt/babel-core`](/packages/babel-core) | [![npm](https://img.shields.io/npm/v/@gerhobbelt/babel-core.svg)](https://www.npmjs.com/package/@gerhobbelt/babel-core) | [![Dependency Status](https://david-dm.org/babel/babel.svg?path=packages/babel-core)](https://david-dm.org/babel/babel?path=packages/babel-core) |
| [`@gerhobbelt/babel-parser`](/packages/babel-parser) | [![npm](https://img.shields.io/npm/v/@gerhobbelt/babel-parser.svg)](https://www.npmjs.com/package/@gerhobbelt/babel-parser) | [![Dependency Status](https://david-dm.org/babel/babel.svg?path=packages/babel-parser)](https://david-dm.org/babel/babel?path=packages/babel-parser) |
| [`@gerhobbelt/babel-traverse`](/packages/babel-traverse) | [![npm](https://img.shields.io/npm/v/@gerhobbelt/babel-traverse.svg)](https://www.npmjs.com/package/@gerhobbelt/babel-traverse) | [![Dependency Status](https://david-dm.org/babel/babel.svg?path=packages/babel-traverse)](https://david-dm.org/babel/babel?path=packages/babel-traverse) |
| [`@gerhobbelt/babel-generator`](/packages/babel-generator) | [![npm](https://img.shields.io/npm/v/@gerhobbelt/babel-generator.svg)](https://www.npmjs.com/package/@gerhobbelt/babel-generator) | [![Dependency Status](https://david-dm.org/babel/babel.svg?path=packages/babel-generator)](https://david-dm.org/babel/babel?path=packages/babel-generator) |

[`@gerhobbelt/babel-core`](/packages/babel-core) is the Babel compiler itself; it exposes the `babel.transform` method, where `transformedCode = transform(src).code`.

The compiler can be broken down into 3 parts:
- The parser: [`@gerhobbelt/babel-parser`](/packages/babel-parser)
- The transformer[s]: All the plugins/presets
  - These all use [`@gerhobbelt/babel-traverse`](/packages/babel-traverse) to traverse through the AST
- The generator: [`@gerhobbelt/babel-generator`](/packages/babel-generator)

The flow goes like this:

input string -> `@gerhobbelt/babel-parser` parser -> `AST` -> transformer[s] -> `AST` -> `@gerhobbelt/babel-generator` -> output string

Check out the [`babel-handbook`](https://github.com/thejameskyle/babel-handbook/blob/master/translations/en/plugin-handbook.md#introduction) for more information on this.

#### Other

| Package | Version | Dependencies |
|--------|-------|------------|
| [`@gerhobbelt/babel-cli`](/packages/babel-cli) | [![npm](https://img.shields.io/npm/v/@gerhobbelt/babel-cli.svg)](https://www.npmjs.com/package/@gerhobbelt/babel-cli) | [![Dependency Status](https://david-dm.org/babel/babel.svg?path=packages/babel-cli)](https://david-dm.org/babel/babel?path=packages/babel-cli) |
| [`@gerhobbelt/babel-types`](/packages/babel-types) | [![npm](https://img.shields.io/npm/v/@gerhobbelt/babel-types.svg)](https://www.npmjs.com/package/@gerhobbelt/babel-types) | [![Dependency Status](https://david-dm.org/babel/babel.svg?path=packages/babel-types)](https://david-dm.org/babel/babel?path=packages/babel-types) |
| [`@gerhobbelt/babel-polyfill`](/packages/babel-polyfill) | [![npm](https://img.shields.io/npm/v/@gerhobbelt/babel-polyfill.svg)](https://www.npmjs.com/package/@gerhobbelt/babel-polyfill) | [![Dependency Status](https://david-dm.org/babel/babel.svg?path=packages/babel-polyfill)](https://david-dm.org/babel/babel?path=packages/babel-polyfill) |
| [`@gerhobbelt/babel-runtime`](/packages/babel-runtime) | [![npm](https://img.shields.io/npm/v/@gerhobbelt/babel-runtime.svg)](https://www.npmjs.com/package/@gerhobbelt/babel-runtime) | [![Dependency Status](https://david-dm.org/babel/babel.svg?path=packages/babel-runtime)](https://david-dm.org/babel/babel?path=packages/babel-runtime) |
| [`@gerhobbelt/babel-register`](/packages/babel-register) | [![npm](https://img.shields.io/npm/v/@gerhobbelt/babel-register.svg)](https://www.npmjs.com/package/@gerhobbelt/babel-register) | [![Dependency Status](https://david-dm.org/babel/babel.svg?path=packages/babel-register)](https://david-dm.org/babel/babel?path=packages/babel-register) |
| [`@gerhobbelt/babel-template`](/packages/babel-template) | [![npm](https://img.shields.io/npm/v/@gerhobbelt/babel-template.svg)](https://www.npmjs.com/package/@gerhobbelt/babel-template) | [![Dependency Status](https://david-dm.org/babel/babel.svg?path=packages/babel-template)](https://david-dm.org/babel/babel?path=packages/babel-template) |
| [`@gerhobbelt/babel-helpers`](/packages/babel-helpers) | [![npm](https://img.shields.io/npm/v/@gerhobbelt/babel-helpers.svg)](https://www.npmjs.com/package/@gerhobbelt/babel-helpers) | [![Dependency Status](https://david-dm.org/babel/babel.svg?path=packages/babel-helpers)](https://david-dm.org/babel/babel?path=packages/babel-helpers) |
| [`@gerhobbelt/babel-code-frame`](/packages/babel-code-frame) | [![npm](https://img.shields.io/npm/v/@gerhobbelt/babel-code-frame.svg)](https://www.npmjs.com/package/@gerhobbelt/babel-code-frame) | [![Dependency Status](https://david-dm.org/babel/babel.svg?path=packages/babel-code-frame)](https://david-dm.org/babel/babel?path=packages/babel-code-frame) |

- [`@gerhobbelt/babel-cli`](/packages/babel-cli) is the CLI tool that runs `@gerhobbelt/babel-core` and helps with outputting to a directory, a file, stdout and more (also includes `@gerhobbelt/babel-node` cli). Check out the [docs](https://babeljs.io/docs/usage/cli/).
- [`@gerhobbelt/babel-types`](/packages/babel-types) is used to validate, build and change AST nodes.
- [`@gerhobbelt/babel-polyfill`](/packages/babel-polyfill) is [literally a wrapper](/packages/babel-polyfill/src/index.js) around [`core-js`](https://github.com/zloirock/core-js) and [regenerator-runtime](https://github.com/facebook/regenerator/tree/master/packages/regenerator-runtime). Check out the [docs](https://babeljs.io/docs/usage/polyfill/).
- [`@gerhobbelt/babel-runtime`](/packages/babel-runtime) is similar to the polyfill except that it doesn't modify the global scope and is to be used with [`@gerhobbelt/babel-plugin-transform-runtime`](/packages/babel-plugin-transform-runtime) (usually in library/plugin code). Check out the [docs](https://babeljs.io/docs/plugins/transform-runtime/).
- [`@gerhobbelt/babel-register`](/packages/babel-register) is a way to automatically compile files with Babel on the fly by binding to Node.js `require`. Check out the [docs](http://babeljs.io/docs/usage/require/).
- [`@gerhobbelt/babel-template`](/packages/babel-template) is a helper function that allows constructing AST nodes from a string presentation of the code; this eliminates the tedium of using `@gerhobbelt/babel-types` for building AST nodes.
- [`@gerhobbelt/babel-helpers`](/packages/babel-helpers) is a set of pre-made `@gerhobbelt/babel-template` functions that are used in some Babel plugins.
- [`@gerhobbelt/babel-code-frame`](/packages/babel-code-frame) is a standalone package used to generate errors that print the source code and point to error locations.

### [Presets](http://babeljs.io/docs/plugins/#presets)

After Babel 6, the default transforms were removed; if you don't specify any plugins/presets, Babel will just return the original source code.

The transformer[s] used in Babel are the independent pieces of code that transform specific things. For example: the [`es2015-arrow-functions`](/packages/babel-plugin-transform-arrow-functions) transform specifically changes arrow functions into regular functions. A preset is simply an array of plugins that make it easier to run a whole set of transforms without specifying each one manually.

| Package | Version | Dependencies | Description |
|--------|-------|------------|---|
| [`@gerhobbelt/babel-preset-env`](/packages/babel-preset-env) | [![npm](https://img.shields.io/npm/v/@gerhobbelt/babel-preset-env.svg)](https://www.npmjs.com/package/@gerhobbelt/babel-preset-env) | [![Dependency Status](https://david-dm.org/babel/babel/status.svg?path=packages/babel-preset-env)](https://david-dm.org/babel/babel?path=packages/babel-preset-env) | automatically determines plugins and polyfills you need based on your supported environments |

> You can find community maintained presets on [npm](https://www.npmjs.com/search?q=babel-preset)

### [Plugins](http://babeljs.io/docs/plugins)

Plugins are the heart of Babel and what make it work.

> You can find community plugins on [npm](https://www.npmjs.com/search?q=babel-plugin).

#### Transform Plugins

There are many kinds of plugins: ones that convert ES6/ES2015 to ES5, transform to ES3, minification, JSX, flow, experimental features, and more. Check out our [website for more](http://babeljs.io/docs/plugins/#transform-plugins).

#### Syntax Plugins

These just enable the transform plugins to be able to parse certain features (the transform plugins already include the syntax plugins so you don't need both): `@gerhobbelt/babel-plugin-syntax-x`. Check out our [website for more](http://babeljs.io/docs/plugins/#syntax-plugins).

### Helpers

These are mostly for internal use in various plugins: `@gerhobbelt/babel-helper-x`.
