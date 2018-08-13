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

function _babelHelperBuilderReactJsx() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-builder-react-jsx"));

  _babelHelperBuilderReactJsx = function () {
    return data;
  };

  return data;
}

function _babelCore() {
  const data = require("@gerhobbelt/babel-core");

  _babelCore = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)(api => {
  api.assertVersion(7);
  return {
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("jsx");
    },

    visitor: (0, _babelHelperBuilderReactJsx().default)({
      pre(state) {
        state.callee = state.tagExpr;
      },

      post(state) {
        if (_babelCore().types.react.isCompatTag(state.tagName)) {
          state.call = _babelCore().types.callExpression(_babelCore().types.memberExpression(_babelCore().types.memberExpression(_babelCore().types.identifier("React"), _babelCore().types.identifier("DOM")), state.tagExpr, _babelCore().types.isLiteral(state.tagExpr)), state.args);
        }
      },

      compat: true
    })
  };
});

exports.default = _default;