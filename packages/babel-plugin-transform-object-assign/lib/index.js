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

var _default = (0, _babelHelperPluginUtils().declare)(api => {
  api.assertVersion(7);
  return {
    name: "transform-object-assign",
    visitor: {
      CallExpression: function (path, file) {
        if (path.get("callee").matchesPattern("Object.assign")) {
          path.node.callee = file.addHelper("extends");
        }
      }
    }
  };
});

exports.default = _default;