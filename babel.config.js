"use strict";

module.exports = function(api) {
  const env = api.env();

  const includeCoverage = process.env.BABEL_COVERAGE === "true";

  const envOpts = {
    loose: true,
    modules: false,
    exclude: ["transform-typeof-symbol"],
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
      envOpts.targets = {
        node: "6.9",
      };
      break;
    case "development":
      envOpts.debug = true;
      envOpts.targets = {
        node: "current",
      };
      break;
    case "test":
      envOpts.targets = {
        node: "current",
      };
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
    presets: [["@gerhobbelt/babel-env", envOpts]],
    plugins: [
      // TODO: Use @gerhobbelt/babel-preset-flow when
      // https://github.com/babel/babel/issues/7233 is fixed
      "@gerhobbelt/babel-plugin-transform-flow-strip-types",
      ["@gerhobbelt/babel-proposal-class-properties", { loose: true }],
      "@gerhobbelt/babel-proposal-export-namespace-from",
      "@gerhobbelt/babel-proposal-numeric-separator",
      [
        "@gerhobbelt/babel-proposal-object-rest-spread",
        { useBuiltIns: true, loose: true },
      ],

      // Explicitly use the lazy version of CommonJS modules.
      convertESM
        ? ["@gerhobbelt/babel-transform-modules-commonjs", { lazy: true }]
        : null,
    ].filter(Boolean),
    overrides: [
      {
        test: "packages/babel-parser",
        plugins: [
          "babel-plugin-transform-charcodes",
          ["@gerhobbelt/babel-transform-for-of", { assumeArray: true }],
        ],
      },
      {
        test: "./packages/babel-register",
        plugins: [
          // Override the root options to disable lazy imports for babel-register
          // because otherwise the require hook will try to lazy-import things
          // leading to dependency cycles.
          convertESM ? "@gerhobbelt/babel-transform-modules-commonjs" : null,
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
          /[\\/]node_modules[\\/](?:@babel\/runtime|babel-runtime|core-js)[\\/]/,
        ],
        plugins: [
          includeRuntime ? "@gerhobbelt/babel-transform-runtime" : null,
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
