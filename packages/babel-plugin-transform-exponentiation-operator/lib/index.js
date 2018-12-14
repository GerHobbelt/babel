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

function _babelHelperBuilderBinaryAssignmentOperatorVisitor() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-builder-binary-assignment-operator-visitor"));

  _babelHelperBuilderBinaryAssignmentOperatorVisitor = function () {
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
    name: "transform-exponentiation-operator",
    visitor: (0, _babelHelperBuilderBinaryAssignmentOperatorVisitor().default)({
      operator: "**",

      build(left, right) {
        return _babelCore().types.callExpression(_babelCore().types.memberExpression(_babelCore().types.identifier("Math"), _babelCore().types.identifier("pow")), [left, right]);
      }

    })
  };
});

exports.default = _default;