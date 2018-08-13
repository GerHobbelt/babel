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

function _babelPluginSyntaxFunctionBind() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-function-bind"));

  _babelPluginSyntaxFunctionBind = function () {
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

var _default = (0, _babelHelperPluginUtils().declare)(api => {
  api.assertVersion(7);

  function getTempId(scope) {
    let id = scope.path.getData("functionBind");
    if (id) return id;
    id = scope.generateDeclaredUidIdentifier("context");
    return scope.path.setData("functionBind", id);
  }

  function getStaticContext(bind, scope) {
    const object = bind.object || bind.callee.object;
    return scope.isStatic(object) && object;
  }

  function inferBindContext(bind, scope) {
    const staticContext = getStaticContext(bind, scope);
    if (staticContext) return _babelCore().types.cloneNode(staticContext);
    const tempId = getTempId(scope);

    if (bind.object) {
      bind.callee = _babelCore().types.sequenceExpression([_babelCore().types.assignmentExpression("=", tempId, bind.object), bind.callee]);
    } else {
      bind.callee.object = _babelCore().types.assignmentExpression("=", tempId, bind.callee.object);
    }

    return tempId;
  }

  return {
    inherits: _babelPluginSyntaxFunctionBind().default,
    visitor: {
      CallExpression({
        node,
        scope
      }) {
        const bind = node.callee;
        if (!_babelCore().types.isBindExpression(bind)) return;
        const context = inferBindContext(bind, scope);
        node.callee = _babelCore().types.memberExpression(bind.callee, _babelCore().types.identifier("call"));
        node.arguments.unshift(context);
      },

      BindExpression(path) {
        const {
          node,
          scope
        } = path;
        const context = inferBindContext(node, scope);
        path.replaceWith(_babelCore().types.callExpression(_babelCore().types.memberExpression(node.callee, _babelCore().types.identifier("bind")), [context]));
      }

    }
  };
});

exports.default = _default;