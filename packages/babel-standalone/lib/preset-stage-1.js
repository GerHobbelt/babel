"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _presetStage = _interopRequireDefault(require("./preset-stage-2"));

function _babelPluginProposalExportDefaultFrom() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-export-default-from"));

  _babelPluginProposalExportDefaultFrom = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalLogicalAssignmentOperators() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-logical-assignment-operators"));

  _babelPluginProposalLogicalAssignmentOperators = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalOptionalChaining() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-optional-chaining"));

  _babelPluginProposalOptionalChaining = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalPipelineOperator() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-pipeline-operator"));

  _babelPluginProposalPipelineOperator = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalNullishCoalescingOperator() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-nullish-coalescing-operator"));

  _babelPluginProposalNullishCoalescingOperator = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalDoExpressions() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-do-expressions"));

  _babelPluginProposalDoExpressions = function () {
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
    decoratorsBeforeExport,
    pipelineProposal = "minimal"
  } = opts;
  return {
    presets: [[_presetStage.default, {
      loose,
      useBuiltIns,
      decoratorsLegacy,
      decoratorsBeforeExport
    }]],
    plugins: [_babelPluginProposalExportDefaultFrom().default, _babelPluginProposalLogicalAssignmentOperators().default, [_babelPluginProposalOptionalChaining().default, {
      loose
    }], [_babelPluginProposalPipelineOperator().default, {
      proposal: pipelineProposal
    }], [_babelPluginProposalNullishCoalescingOperator().default, {
      loose
    }], _babelPluginProposalDoExpressions().default]
  };
};

exports.default = _default;