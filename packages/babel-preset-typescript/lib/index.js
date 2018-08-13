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

function _babelPluginTransformTypescript() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-typescript"));

  _babelPluginTransformTypescript = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)((api, {
  jsxPragma,
  allExtensions = false,
  isTSX = false
}) => {
  api.assertVersion(7);

  if (typeof allExtensions !== "boolean") {
    throw new Error(".allExtensions must be a boolean, or undefined");
  }

  if (typeof isTSX !== "boolean") {
    throw new Error(".isTSX must be a boolean, or undefined");
  }

  if (isTSX && !allExtensions) {
    throw new Error("isTSX:true requires allExtensions:true");
  }

  return {
    overrides: allExtensions ? [{
      plugins: [[_babelPluginTransformTypescript().default, {
        jsxPragma,
        isTSX
      }]]
    }] : [{
      test: /\.ts$/,
      plugins: [[_babelPluginTransformTypescript().default, {
        jsxPragma
      }]]
    }, {
      test: /\.tsx$/,
      plugins: [[_babelPluginTransformTypescript().default, {
        jsxPragma,
        isTSX: true
      }]]
    }]
  };
});

exports.default = _default;