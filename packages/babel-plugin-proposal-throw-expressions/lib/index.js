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

function _babelPluginSyntaxThrowExpressions() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-throw-expressions"));

  _babelPluginSyntaxThrowExpressions = function () {
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
    inherits: _babelPluginSyntaxThrowExpressions().default,
    visitor: {
      UnaryExpression(path) {
        const {
          operator,
          argument
        } = path.node;
        if (operator !== "throw") return;

        const arrow = _babelCore().types.functionExpression(null, [_babelCore().types.identifier("e")], _babelCore().types.blockStatement([_babelCore().types.throwStatement(_babelCore().types.identifier("e"))]));

        path.replaceWith(_babelCore().types.callExpression(arrow, [argument]));
      }

    }
  };
});

exports.default = _default;