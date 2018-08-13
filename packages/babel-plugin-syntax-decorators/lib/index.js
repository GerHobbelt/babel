"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _babelHelperPluginUtils() {
  const data = require("@gerhobbelt/babel-helper-plugin-utils");

  _babelHelperPluginUtils = function () {
    return data;
  };

  return data;
}

var _default = (0, _babelHelperPluginUtils().declare)((api, options) => {
  api.assertVersion(7);
  const {
    legacy = false
  } = options;

  if (typeof legacy !== "boolean") {
    throw new Error("'legacy' must be a boolean.");
  }

  if (legacy !== true) {
    throw new Error("The new decorators proposal is not supported yet." + ' You must pass the `"legacy": true` option to' + " @gerhobbelt/babel-plugin-syntax-decorators");
  }

  const {
    decoratorsBeforeExport
  } = options;

  if (decoratorsBeforeExport !== undefined) {
    if (legacy) {
      throw new Error("'decoratorsBeforeExport' can't be used with legacy decorators.");
    }

    if (typeof decoratorsBeforeExport !== "boolean") {
      throw new Error("'decoratorsBeforeExport' must be a boolean.");
    }
  }

  return {
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push(legacy ? "decorators-legacy" : ["decorators", {
        decoratorsBeforeExport
      }]);
    }

  };
});

exports.default = _default;