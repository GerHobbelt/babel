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

function _babelPluginSyntaxJsonStrings() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-json-strings"));

  _babelPluginSyntaxJsonStrings = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)(api => {
  api.assertVersion(7);
  const regex = /(\\*)([\u2028\u2029])/g;

  function replace(match, escapes, separator) {
    const isEscaped = escapes.length % 2 === 1;
    if (isEscaped) return match;
    return `${escapes}\\u${separator.charCodeAt(0).toString(16)}`;
  }

  return {
    inherits: _babelPluginSyntaxJsonStrings().default,
    visitor: {
      "DirectiveLiteral|StringLiteral"({
        node
      }) {
        const {
          extra
        } = node;
        if (!extra || !extra.raw) return;
        extra.raw = extra.raw.replace(regex, replace);
      }

    }
  };
});

exports.default = _default;