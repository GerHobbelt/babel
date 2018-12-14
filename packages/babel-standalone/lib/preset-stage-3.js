"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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

function _babelPluginProposalPrivateMethods() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-private-methods"));

  _babelPluginProposalPrivateMethods = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (_, opts) => {
  let loose = false;

  if (opts !== undefined) {
    if (opts.loose !== undefined) loose = opts.loose;
  }

  return {
    plugins: [_babelPluginSyntaxDynamicImport().default, _babelPluginSyntaxImportMeta().default, [_babelPluginProposalClassProperties().default, {
      loose
    }], _babelPluginProposalJsonStrings().default, [_babelPluginProposalPrivateMethods().default, {
      loose
    }]]
  };
};

exports.default = _default;