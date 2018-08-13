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

function _babelPluginTransformReactJsx() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-react-jsx"));

  _babelPluginTransformReactJsx = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformReactDisplayName() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-react-display-name"));

  _babelPluginTransformReactDisplayName = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformReactJsxSource() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-react-jsx-source"));

  _babelPluginTransformReactJsxSource = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformReactJsxSelf() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-react-jsx-self"));

  _babelPluginTransformReactJsxSelf = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)((api, opts) => {
  api.assertVersion(7);
  const pragma = opts.pragma || "React.createElement";
  const pragmaFrag = opts.pragmaFrag || "React.Fragment";
  const throwIfNamespace = opts.throwIfNamespace === undefined ? true : !!opts.throwIfNamespace;
  const development = !!opts.development;
  const useBuiltIns = !!opts.useBuiltIns;

  if (typeof development !== "boolean") {
    throw new Error("@gerhobbelt/babel-preset-react 'development' option must be a boolean.");
  }

  return {
    plugins: [[_babelPluginTransformReactJsx().default, {
      pragma,
      pragmaFrag,
      throwIfNamespace,
      useBuiltIns
    }], _babelPluginTransformReactDisplayName().default, development && _babelPluginTransformReactJsxSource().default, development && _babelPluginTransformReactJsxSelf().default].filter(Boolean)
  };
});

exports.default = _default;