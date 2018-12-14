"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _presetStage = _interopRequireDefault(require("./preset-stage-3"));

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

var _default = (_, opts = {}) => {
  const {
    loose = false,
    useBuiltIns = false,
    decoratorsLegacy = false,
    decoratorsBeforeExport
  } = opts;
  return {
    presets: [[_presetStage.default, {
      loose,
      useBuiltIns
    }]],
    plugins: [[_babelPluginProposalDecorators().default, {
      legacy: decoratorsLegacy,
      decoratorsBeforeExport
    }], _babelPluginProposalFunctionSent().default, _babelPluginProposalExportNamespaceFrom().default, _babelPluginProposalNumericSeparator().default, _babelPluginProposalThrowExpressions().default]
  };
};

exports.default = _default;