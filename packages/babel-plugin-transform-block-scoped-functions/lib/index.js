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

  function statementList(key, path) {
    const paths = path.get(key);

    for (const path of paths) {
      const func = path.node;
      if (!path.isFunctionDeclaration()) continue;

      const declar = _babelCore().types.variableDeclaration("let", [_babelCore().types.variableDeclarator(func.id, _babelCore().types.toExpression(func))]);

      declar._blockHoist = 2;
      func.id = null;
      path.replaceWith(declar);
    }
  }

  return {
    name: "transform-block-scoped-functions",
    visitor: {
      BlockStatement(path) {
        const {
          node,
          parent
        } = path;

        if (_babelCore().types.isFunction(parent, {
          body: node
        }) || _babelCore().types.isExportDeclaration(parent)) {
          return;
        }

        statementList("body", path);
      },

      SwitchCase(path) {
        statementList("consequent", path);
      }

    }
  };
});

exports.default = _default;