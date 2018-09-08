# @gerhobbelt/babel-preset-stage-1

As of v7.0.0-beta.55, we've removed Babel's Stage presets. Please consider reading our [blog post](https://babeljs.io/blog/2018/07/27/removing-babels-stage-presets) on this decision for more details. TL;DR is that it's more beneficial in the long run to explicitly add which proposals to use.

---

For a more automatic migration, we have updated [babel-upgrade](https://github.com/babel/babel-upgrade) to do this for you (you can run `npx babel-upgrade`).

If you want the same configuration as before:

```jsonc
{
  "plugins": [
    // Stage 1
    "@gerhobbelt/babel-plugin-proposal-export-default-from",
    "@gerhobbelt/babel-plugin-proposal-logical-assignment-operators",
    ["@gerhobbelt/babel-plugin-proposal-optional-chaining", { "loose": false }],
    ["@gerhobbelt/babel-plugin-proposal-pipeline-operator", { "proposal": "minimal" }],
    ["@gerhobbelt/babel-plugin-proposal-nullish-coalescing-operator", { "loose": false }],
    "@gerhobbelt/babel-plugin-proposal-do-expressions",

    // Stage 2
    ["@gerhobbelt/babel-plugin-proposal-decorators", { "legacy": true }],
    "@gerhobbelt/babel-plugin-proposal-function-sent",
    "@gerhobbelt/babel-plugin-proposal-export-namespace-from",
    "@gerhobbelt/babel-plugin-proposal-numeric-separator",
    "@gerhobbelt/babel-plugin-proposal-throw-expressions",

    // Stage 3
    "@gerhobbelt/babel-plugin-syntax-dynamic-import",
    "@gerhobbelt/babel-plugin-syntax-import-meta",
    ["@gerhobbelt/babel-plugin-proposal-class-properties", { "loose": false }],
    "@gerhobbelt/babel-plugin-proposal-json-strings"
  ]
}
```

If you're using the same configuration across many separate projects,
keep in mind that you can also create your own custom presets with
whichever plugins and presets you're looking to use.

```js
module.exports = function() {
  return {
    plugins: [
      require("@gerhobbelt/babel-plugin-syntax-dynamic-import"),
      [require("@gerhobbelt/babel-plugin-proposal-decorators"), { "legacy": true }],
      [require("@gerhobbelt/babel-plugin-proposal-class-properties"), { "loose": false }],
    ],
    presets: [
      // ...
    ],
  };
};
```
