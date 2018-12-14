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

function _babelHelperRemapAsyncToGenerator() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-remap-async-to-generator"));

  _babelHelperRemapAsyncToGenerator = function () {
    return data;
  };

  return data;
}

function _babelHelperModuleImports() {
  const data = require("@gerhobbelt/babel-helper-module-imports");

  _babelHelperModuleImports = function () {
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)((api, options) => {
  api.assertVersion(7);
  const {
    method,
    module
  } = options;

  if (method && module) {
    return {
      name: "transform-async-to-generator",
      visitor: {
        Function(path, state) {
          if (!path.node.async || path.node.generator) return;
          let wrapAsync = state.methodWrapper;

          if (wrapAsync) {
            wrapAsync = _babelCore().types.cloneNode(wrapAsync);
          } else {
            wrapAsync = state.methodWrapper = (0, _babelHelperModuleImports().addNamed)(path, method, module);
          }

          (0, _babelHelperRemapAsyncToGenerator().default)(path, {
            wrapAsync
          });
        }

      }
    };
  }

  return {
    name: "transform-async-to-generator",
    visitor: {
      Function(path, state) {
        if (!path.node.async || path.node.generator) return;
        (0, _babelHelperRemapAsyncToGenerator().default)(path, {
          wrapAsync: state.addHelper("asyncToGenerator")
        });
      }

    }
  };
});

exports.default = _default;