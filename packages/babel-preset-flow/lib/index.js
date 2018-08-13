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

function _babelPluginTransformFlowStripTypes() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-flow-strip-types"));

  _babelPluginTransformFlowStripTypes = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)((api, {
  all
}) => {
  api.assertVersion(7);
  return {
    plugins: [[_babelPluginTransformFlowStripTypes().default, {
      all
    }]]
  };
});

exports.default = _default;