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
    name: "transform-member-expression-literals",
    visitor: {
      MemberExpression: {
        exit({
          node
        }) {
          const prop = node.property;

          if (!node.computed && _babelCore().types.isIdentifier(prop) && !_babelCore().types.isValidES3Identifier(prop.name)) {
            node.property = _babelCore().types.stringLiteral(prop.name);
            node.computed = true;
          }
        }

      }
    }
  };
});

exports.default = _default;