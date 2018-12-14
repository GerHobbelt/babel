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
    name: "transform-jscript",
    visitor: {
      FunctionExpression: {
        exit(path) {
          const {
            node
          } = path;
          if (!node.id) return;
          path.replaceWith(_babelCore().types.callExpression(_babelCore().types.functionExpression(null, [], _babelCore().types.blockStatement([_babelCore().types.toStatement(node), _babelCore().types.returnStatement(_babelCore().types.cloneNode(node.id))])), []));
        }

      }
    }
  };
});

exports.default = _default;