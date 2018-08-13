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
  const data = _interopRequireDefault(require("@gerhobbelt/babel-preset-stage-1"));

  _babelPresetStage = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalFunctionBind() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-function-bind"));

  _babelPluginProposalFunctionBind = function () {
    return data;
  };

  return data;
}

function _babelPluginProposalPipelineOperator() {
  const data = require("@gerhobbelt/babel-plugin-proposal-pipeline-operator");

  _babelPluginProposalPipelineOperator = function () {
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
    decoratorsLegacy = false,
    pipelineProposal
  } = opts;

  if (typeof loose !== "boolean") {
    throw new Error("@gerhobbelt/babel-preset-stage-0 'loose' option must be a boolean.");
  }

  if (typeof useBuiltIns !== "boolean") {
    throw new Error("@gerhobbelt/babel-preset-stage-0 'useBuiltIns' option must be a boolean.");
  }

  if (typeof decoratorsLegacy !== "boolean") {
    throw new Error("@gerhobbelt/babel-preset-stage-0 'decoratorsLegacy' option must be a boolean.");
  }

  if (decoratorsLegacy !== true) {
    throw new Error("The new decorators proposal is not supported yet." + ' You must pass the `"decoratorsLegacy": true` option to' + " @gerhobbelt/babel-preset-stage-0");
  }

  if (typeof pipelineProposal !== "string") {
    throw new Error("The pipeline operator requires a proposal set." + " You must pass 'pipelineProposal' option to" + " @gerhobbelt/babel-preset-stage-0 whose value must be one of: " + _babelPluginProposalPipelineOperator().proposals.join(", "));
  }

  return {
    presets: [[_babelPresetStage().default, {
      loose,
      useBuiltIns,
      decoratorsLegacy,
      pipelineProposal
    }]],
    plugins: [_babelPluginProposalFunctionBind().default]
  };
});

exports.default = _default;