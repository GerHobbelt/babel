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

function _babelHelperAnnotateAsPure() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-annotate-as-pure"));

  _babelHelperAnnotateAsPure = function () {
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

function _babelHelperSplitExportDeclaration() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-split-export-declaration"));

  _babelHelperSplitExportDeclaration = function () {
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

function _globals() {
  const data = _interopRequireDefault(require("globals"));

  _globals = function () {
    return data;
  };

  return data;
}

var _transformClass = _interopRequireDefault(require("./transformClass"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getBuiltinClasses = category => Object.keys(_globals().default[category]).filter(name => /^[A-Z]/.test(name));

const builtinClasses = new Set([...getBuiltinClasses("builtin"), ...getBuiltinClasses("browser")]);

var _default = (0, _babelHelperPluginUtils().declare)((api, options) => {
  api.assertVersion(7);
  const {
    loose
  } = options;
  const VISITED = Symbol();
  return {
    visitor: {
      ExportDefaultDeclaration(path) {
        if (!path.get("declaration").isClassDeclaration()) return;
        (0, _babelHelperSplitExportDeclaration().default)(path);
      },

      ClassDeclaration(path) {
        const {
          node
        } = path;
        const ref = node.id || path.scope.generateUidIdentifier("class");
        path.replaceWith(_babelCore().types.variableDeclaration("let", [_babelCore().types.variableDeclarator(ref, _babelCore().types.toExpression(node))]));
      },

      ClassExpression(path, state) {
        const {
          node
        } = path;
        if (node[VISITED]) return;
        const inferred = (0, _babelHelperFunctionName().default)(path);

        if (inferred && inferred !== node) {
          path.replaceWith(inferred);
          return;
        }

        node[VISITED] = true;
        path.replaceWith((0, _transformClass.default)(path, state.file, builtinClasses, loose));

        if (path.isCallExpression()) {
          (0, _babelHelperAnnotateAsPure().default)(path);

          if (path.get("callee").isArrowFunctionExpression()) {
            path.get("callee").arrowFunctionToExpression();
          }
        }
      }

    }
  };
});

exports.default = _default;