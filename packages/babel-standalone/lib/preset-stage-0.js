"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _presetStage = _interopRequireDefault(require("./preset-stage-1"));

function _babelPluginProposalFunctionBind() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-proposal-function-bind"));

  _babelPluginProposalFunctionBind = function () {
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
    pipelineProposal = "minimal"
  } = opts;
  return {
    presets: [[_presetStage.default, {
      loose,
      useBuiltIns,
      decoratorsLegacy,
      pipelineProposal
    }]],
    plugins: [_babelPluginProposalFunctionBind().default]
  };
};

exports.default = _default;