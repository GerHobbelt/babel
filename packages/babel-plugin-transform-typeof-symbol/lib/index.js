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

function _babelCore() {
  const data = require("@gerhobbelt/babel-core");

  _babelCore = function () {
    return data;
  };

  return data;
}

var _default = (0, _babelHelperPluginUtils().declare)(api => {
  api.assertVersion(7);
  return {
    visitor: {
      Scope({
        scope
      }) {
        if (!scope.getBinding("Symbol")) {
          return;
        }

        scope.rename("Symbol");
      },

      UnaryExpression(path) {
        const {
          node,
          parent
        } = path;
        if (node.operator !== "typeof") return;

        if (path.parentPath.isBinaryExpression() && _babelCore().types.EQUALITY_BINARY_OPERATORS.indexOf(parent.operator) >= 0) {
          const opposite = path.getOpposite();

          if (opposite.isLiteral() && opposite.node.value !== "symbol" && opposite.node.value !== "object") {
            return;
          }
        }

        const helper = this.addHelper("typeof");
        const isUnderHelper = path.findParent(path => {
          return path.isVariableDeclarator() && path.node.id === helper || path.isFunctionDeclaration() && path.node.id && path.node.id.name === helper.name;
        });

        if (isUnderHelper) {
          return;
        }

        const call = _babelCore().types.callExpression(helper, [node.argument]);

        const arg = path.get("argument");

        if (arg.isIdentifier() && !path.scope.hasBinding(arg.node.name, true)) {
          const unary = _babelCore().types.unaryExpression("typeof", _babelCore().types.cloneNode(node.argument));

          path.replaceWith(_babelCore().types.conditionalExpression(_babelCore().types.binaryExpression("===", unary, _babelCore().types.stringLiteral("undefined")), _babelCore().types.stringLiteral("undefined"), call));
        } else {
          path.replaceWith(call);
        }
      }

    }
  };
});

exports.default = _default;