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
      ObjectProperty: {
        exit({
          node
        }) {
          const key = node.key;

          if (!node.computed && _babelCore().types.isIdentifier(key) && !_babelCore().types.isValidES3Identifier(key.name)) {
            node.key = _babelCore().types.stringLiteral(key.name);
          }
        }

      }
    }
  };
});

exports.default = _default;