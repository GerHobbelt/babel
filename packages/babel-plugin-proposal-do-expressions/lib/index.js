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

function _babelPluginSyntaxDoExpressions() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-do-expressions"));

  _babelPluginSyntaxDoExpressions = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)(api => {
  api.assertVersion(7);
  return {
    inherits: _babelPluginSyntaxDoExpressions().default,
    visitor: {
      DoExpression: {
        exit(path) {
          const body = path.node.body.body;

          if (body.length) {
            path.replaceExpressionWithStatements(body);
          } else {
            path.replaceWith(path.scope.buildUndefinedNode());
          }
        }

      }
    }
  };
});

exports.default = _default;