"use strict";

module.exports = function(api) {
  const env = api.env();

  const includeCoverage = process.env.BABEL_COVERAGE === "true";

  const nodeVersion = "6.9";

  const envOpts = {
    loose: true,
    modules: false,
    //debug: true,
    exclude: ["transform-typeof-symbol"],
    targets: {
      // node: "current",
      node: nodeVersion,

      // node: "6.9",
      // node: "8.11",

      // node: "4",
      // browsers: "> 5%",
    },
  };

  let convertESM = true;
  let ignoreLib = true;
  let includeRuntime = false;

  switch (env) {
    // Configs used during bundling builds.
    case "babel-parser":
      convertESM = false;
      ignoreLib = false;
      break;
    case "standalone":
      convertESM = false;
      ignoreLib = false;
      includeRuntime = true;
      break;
    case "production":
      // Config during builds before publish.
      break;
    case "development":
      break;
    case "test":
      break;
  }

  const config = {
    // Our dependencies are all standard CommonJS, along with all sorts of
    // other random files in Babel's codebase, so we use script as the default,
    // and then mark actual modules as modules farther down.
    //sourceType: "script",
    comments: false,
    ignore: [
      // These may not be strictly necessary with the newly-limited scope of
      // babelrc searching, but including them for now because we had them
      // in our .babelignore before.
      "packages/*/test/fixtures",
      ignoreLib ? "packages/*/lib" : null,
      "packages/babel-standalone/babel.js",
      "packages/babel-preset-env-standalone/babel-preset-env.js",
    ].filter(Boolean),
    presets: [["@gerhobbelt/babel-preset-env", envOpts]],
    plugins: [
      // TODO: Use @gerhobbelt/babel-preset-flow when
      // https://github.com/babel/babel/issues/7233 is fixed
      "@gerhobbelt/babel-plugin-transform-flow-strip-types",
      ["@gerhobbelt/babel-plugin-proposal-class-properties", { loose: true }],
      "@gerhobbelt/babel-plugin-proposal-export-namespace-from",
      "@gerhobbelt/babel-plugin-proposal-numeric-separator",
      [
        "@gerhobbelt/babel-plugin-proposal-object-rest-spread",
        { useBuiltIns: true, loose: true },
      ],

      // Explicitly use the lazy version of CommonJS modules.
      convertESM
        ? [
            "@gerhobbelt/babel-plugin-transform-modules-commonjs",
            { lazy: true },
          ]
        : null,
    ].filter(Boolean),
    overrides: [
      {
        test: "packages/babel-parser",
        plugins: [
          "babel-plugin-transform-charcodes",
          ["@gerhobbelt/babel-plugin-transform-for-of", { assumeArray: true }],
        ],
      },
      {
        test: "./packages/babel-register",
        plugins: [
          // Override the root options to disable lazy imports for babel-register
          // because otherwise the require hook will try to lazy-import things
          // leading to dependency cycles.
          convertESM
            ? "@gerhobbelt/babel-plugin-transform-modules-commonjs"
            : null,
        ].filter(Boolean),
      },
      {
        // The vast majority of our src files are modules, but we use
        // unambiguous to keep things simple until we get around to renaming
        // the modules to be more easily distinguished from CommonJS
        test: [
          "packages/*/src",
          "packages/*/test",
          "codemods/*/src",
          "codemods/*/test",
        ],
        sourceType: "unambiguous",
      },
      {
        // The runtime transform shouldn't process its own runtime or core-js.
        exclude: [
          "packages/babel-runtime",
          /[\\/]node_modules[\\/](?:@gerhobbelt\/babel-runtime|@babel\/runtime|babel-runtime|core-js)[\\/]/,
        ],
        plugins: [
          includeRuntime ? "@gerhobbelt/babel-plugin-transform-runtime" : null,
        ].filter(Boolean),
      },
    ].filter(Boolean),
  };

  // we need to do this as long as we do not test everything from source
  if (includeCoverage) {
    config.auxiliaryCommentBefore = "istanbul ignore next";
    config.plugins.push("babel-plugin-istanbul");
  }

  return config;
};
