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

function _babelPluginSyntaxDynamicImport() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-dynamic-import"));

  _babelPluginSyntaxDynamicImport = function () {
    return data;
  };

  return data;
}

function _babelPluginSyntaxImportMeta() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-import-meta"));

  _babelPluginSyntaxImportMeta = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalAsyncGeneratorFunctions() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-async-generator-functions"));

  _babelPluginProposalAsyncGeneratorFunctions = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalClassProperties() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-class-properties"));

  _babelPluginProposalClassProperties = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalJsonStrings() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-json-strings"));

  _babelPluginProposalJsonStrings = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalObjectRestSpread() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-object-rest-spread"));

  _babelPluginProposalObjectRestSpread = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalOptionalCatchBinding() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-optional-catch-binding"));

  _babelPluginProposalOptionalCatchBinding = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalUnicodePropertyRegex() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-unicode-property-regex"));

  _babelPluginProposalUnicodePropertyRegex = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)((api, opts) => {
  api.assertVersion(7);
  let loose = false;
  let useBuiltIns = false;

  if (opts !== undefined) {
    if (opts.loose !== undefined) loose = opts.loose;
    if (opts.useBuiltIns !== undefined) useBuiltIns = opts.useBuiltIns;
  }

  if (typeof loose !== "boolean") {
    throw new Error("@gerhobbelt/babel-preset-stage-3 'loose' option must be a boolean.");
  }

  if (typeof useBuiltIns !== "boolean") {
    throw new Error("@gerhobbelt/babel-preset-stage-3 'useBuiltIns' option must be a boolean.");
  }

  return {
    plugins: [_babelPluginSyntaxDynamicImport().default, _babelPluginSyntaxImportMeta().default, _babelPluginProposalAsyncGeneratorFunctions().default, [_babelPluginProposalClassProperties().default, {
      loose
    }], _babelPluginProposalJsonStrings().default, [_babelPluginProposalObjectRestSpread().default, {
      loose,
      useBuiltIns
    }], _babelPluginProposalOptionalCatchBinding().default, _babelPluginProposalUnicodePropertyRegex().default]
  };
});

exports.default = _default;