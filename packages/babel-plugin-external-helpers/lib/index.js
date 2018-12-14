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

function _babelCore() {
  const data = require("@gerhobbelt/babel-core");

  _babelCore = function () {
    return data;
  };

  return data;
}

var _default = (0, _babelHelperPluginUtils().declare)((api, options) => {
  api.assertVersion(7);
  const {
    helperVersion = "7.0.0-beta.0",
    whitelist = false
  } = options;

  if (whitelist !== false && (!Array.isArray(whitelist) || whitelist.some(w => typeof w !== "string"))) {
    throw new Error(".whitelist must be undefined, false, or an array of strings");
  }

  const helperWhitelist = whitelist ? new Set(whitelist) : null;
  return {
    name: "external-helpers",

    pre(file) {
      file.set("helperGenerator", name => {
        if (file.availableHelper && !file.availableHelper(name, helperVersion)) {
          return;
        }

        if (helperWhitelist && !helperWhitelist.has(name)) return;
        return _babelCore().types.memberExpression(_babelCore().types.identifier("babelHelpers"), _babelCore().types.identifier(name));
      });
    }

  };
});

exports.default = _default;