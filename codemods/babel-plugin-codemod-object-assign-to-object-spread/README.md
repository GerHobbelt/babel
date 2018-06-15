# @gerhobbelt/babel-plugin-codemod-object-assign-to-object-spread

Transforms old code that uses `Object.assign` with an Object Literal as
the first param to use Object Spread syntax.

## Examples

```js
const obj = Object.assign({
  test1: 1,
}, other, {
  test2: 2,
}, other2);
```

Is transformed to:

```js
const obj = {
  test1: 1,
  ...other,
  test2: 2,
  ...other2,
};
```

## Installation

```sh
npm install --save-dev @gerhobbelt/babel-plugin-codemod-object-assign-to-object-spread
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["@gerhobbelt/babel-plugin-codemod-object-assign-to-object-spread"]
}
```

### Via CLI

```sh
babel --plugins @gerhobbelt/babel-plugin-codemod-object-assign-to-object-spread script.js
```

### Via Node API

```javascript
require("@gerhobbelt/babel-core").transform("code", {
  plugins: ["@gerhobbelt/babel-plugin-codemod-object-assign-to-object-spread"]
});
```
