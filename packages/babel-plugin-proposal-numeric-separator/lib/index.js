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

function _babelPluginSyntaxNumericSeparator() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-numeric-separator"));

  _babelPluginSyntaxNumericSeparator = function () {
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

  function replaceNumberArg({
    node
  }) {
    if (node.callee.name !== "Number") {
      return;
    }

    const arg = node.arguments[0];

    if (!_babelCore().types.isStringLiteral(arg)) {
      return;
    }

    arg.value = arg.value.replace(/_/g, "");
  }

  return {
    name: "proposal-numeric-separator",
    inherits: _babelPluginSyntaxNumericSeparator().default,
    visitor: {
      CallExpression: replaceNumberArg,
      NewExpression: replaceNumberArg,

      NumericLiteral({
        node
      }) {
        const {
          extra
        } = node;

        if (extra && /_/.test(extra.raw)) {
          extra.raw = extra.raw.replace(/_/g, "");
        }
      }

    }
  };
});

exports.default = _default;