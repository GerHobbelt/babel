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
    name: "transform-instanceof",
    visitor: {
      BinaryExpression(path) {
        const {
          node
        } = path;

        if (node.operator === "instanceof") {
          const helper = this.addHelper("instanceof");
          const isUnderHelper = path.findParent(path => {
            return path.isVariableDeclarator() && path.node.id === helper || path.isFunctionDeclaration() && path.node.id && path.node.id.name === helper.name;
          });

          if (isUnderHelper) {
            return;
          } else {
            path.replaceWith(_babelCore().types.callExpression(helper, [node.left, node.right]));
          }
        }
      }

    }
  };
});

exports.default = _default;