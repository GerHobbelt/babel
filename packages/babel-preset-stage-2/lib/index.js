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

function _babelPresetStage() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-preset-stage-3"));

  _babelPresetStage = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalDecorators() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-decorators"));

  _babelPluginProposalDecorators = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalFunctionSent() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-function-sent"));

  _babelPluginProposalFunctionSent = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalExportNamespaceFrom() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-export-namespace-from"));

  _babelPluginProposalExportNamespaceFrom = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalNumericSeparator() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-numeric-separator"));

  _babelPluginProposalNumericSeparator = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalThrowExpressions() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-throw-expressions"));

  _babelPluginProposalThrowExpressions = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)((api, opts = {}) => {
  api.assertVersion(7);
  const {
    loose = false,
    useBuiltIns = false,
    decoratorsLegacy = false
  } = opts;

  if (typeof loose !== "boolean") {
    throw new Error("@gerhobbelt/babel-preset-stage-2 'loose' option must be a boolean.");
  }

  if (typeof useBuiltIns !== "boolean") {
    throw new Error("@gerhobbelt/babel-preset-stage-2 'useBuiltIns' option must be a boolean.");
  }

  if (typeof decoratorsLegacy !== "boolean") {
    throw new Error("@gerhobbelt/babel-preset-stage-2 'decoratorsLegacy' option must be a boolean.");
  }

  if (decoratorsLegacy !== true) {
    throw new Error("The new decorators proposal is not supported yet." + ' You must pass the `"decoratorsLegacy": true` option to' + " @gerhobbelt/babel-preset-stage-2");
  }

  return {
    presets: [[_babelPresetStage().default, {
      loose,
      useBuiltIns
    }]],
    plugins: [[_babelPluginProposalDecorators().default, {
      legacy: decoratorsLegacy
    }], _babelPluginProposalFunctionSent().default, _babelPluginProposalExportNamespaceFrom().default, _babelPluginProposalNumericSeparator().default, _babelPluginProposalThrowExpressions().default]
  };
});

exports.default = _default;