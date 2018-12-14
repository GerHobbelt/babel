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

function _babelHelperFunctionName() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-function-name"));

  _babelHelperFunctionName = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)(api => {
  api.assertVersion(7);
  return {
    name: "transform-function-name",
    visitor: {
      FunctionExpression: {
        exit(path) {
          if (path.key !== "value" && !path.parentPath.isObjectProperty()) {
            const replacement = (0, _babelHelperFunctionName().default)(path);
            if (replacement) path.replaceWith(replacement);
          }
        }

      },

      ObjectProperty(path) {
        const value = path.get("value");

        if (value.isFunction()) {
          const newNode = (0, _babelHelperFunctionName().default)(value);
          if (newNode) value.replaceWith(newNode);
        }
      }

    }
  };
});

exports.default = _default;