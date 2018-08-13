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
  const data = _interopRequireDefault(require("@gerhobbelt/babel-preset-stage-2"));

  _babelPresetStage = function () {
    return data;
  };

  return data;
}

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
  const data = _interopRequireWildcard(require("@gerhobbelt/babel-plugin-proposal-pipeline-operator"));

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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)((api, opts = {}) => {
  api.assertVersion(7);
  const {
    loose = false,
    useBuiltIns = false,
    decoratorsLegacy = false,
    pipelineProposal
  } = opts;

  if (typeof loose !== "boolean") {
    throw new Error("@gerhobbelt/babel-preset-stage-1 'loose' option must be a boolean.");
  }

  if (typeof useBuiltIns !== "boolean") {
    throw new Error("@gerhobbelt/babel-preset-stage-1 'useBuiltIns' option must be a boolean.");
  }

  if (typeof decoratorsLegacy !== "boolean") {
    throw new Error("@gerhobbelt/babel-preset-stage-1 'decoratorsLegacy' option must be a boolean.");
  }

  if (decoratorsLegacy !== true) {
    throw new Error("The new decorators proposal is not supported yet." + ' You must pass the `"decoratorsLegacy": true` option to' + " @gerhobbelt/babel-preset-stage-1");
  }

  if (typeof pipelineProposal !== "string") {
    throw new Error("The pipeline operator requires a proposal set." + " You must pass 'pipelineProposal' option to" + " @gerhobbelt/babel-preset-stage-1 whose value must be one of: " + _babelPluginProposalPipelineOperator().proposals.join(", "));
  }

  return {
    presets: [[_babelPresetStage().default, {
      loose,
      useBuiltIns,
      decoratorsLegacy
    }]],
    plugins: [_babelPluginProposalExportDefaultFrom().default, _babelPluginProposalLogicalAssignmentOperators().default, [_babelPluginProposalOptionalChaining().default, {
      loose
    }], [_babelPluginProposalPipelineOperator().default, {
      proposal: pipelineProposal
    }], [_babelPluginProposalNullishCoalescingOperator().default, {
      loose
    }], _babelPluginProposalDoExpressions().default]
  };
});

exports.default = _default;