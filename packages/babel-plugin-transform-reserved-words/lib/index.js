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
    name: "transform-reserved-words",
    visitor: {
      "BindingIdentifier|ReferencedIdentifier"(path) {
        if (!_babelCore().types.isValidES3Identifier(path.node.name)) {
          path.scope.rename(path.node.name);
        }
      }

    }
  };
});

exports.default = _default;