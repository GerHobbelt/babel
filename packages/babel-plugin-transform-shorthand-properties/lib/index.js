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
    name: "transform-shorthand-properties",
    visitor: {
      ObjectMethod(path) {
        const {
          node
        } = path;

        if (node.kind === "method") {
          const func = _babelCore().types.functionExpression(null, node.params, node.body, node.generator, node.async);

          func.returnType = node.returnType;
          path.replaceWith(_babelCore().types.objectProperty(node.key, func, node.computed));
        }
      },

      ObjectProperty({
        node
      }) {
        if (node.shorthand) {
          node.shorthand = false;
        }
      }

    }
  };
});

exports.default = _default;