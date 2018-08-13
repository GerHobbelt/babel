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
      Program(path) {
        const {
          node
        } = path;

        for (const directive of node.directives) {
          if (directive.value.value === "use strict") return;
        }

        path.unshiftContainer("directives", _babelCore().types.directive(_babelCore().types.directiveLiteral("use strict")));
      }

    }
  };
});

exports.default = _default;