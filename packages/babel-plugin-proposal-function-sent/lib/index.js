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

function _babelPluginSyntaxFunctionSent() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-function-sent"));

  _babelPluginSyntaxFunctionSent = function () {
    return data;
  };

  return data;
}

function _babelHelperWrapFunction() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-wrap-function"));

  _babelHelperWrapFunction = function () {
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

  const isFunctionSent = node => _babelCore().types.isIdentifier(node.meta, {
    name: "function"
  }) && _babelCore().types.isIdentifier(node.property, {
    name: "sent"
  });

  const hasBeenReplaced = (node, sentId) => _babelCore().types.isAssignmentExpression(node) && _babelCore().types.isIdentifier(node.left, {
    name: sentId
  });

  const yieldVisitor = {
    Function(path) {
      path.skip();
    },

    YieldExpression(path) {
      if (!hasBeenReplaced(path.parent, this.sentId)) {
        path.replaceWith(_babelCore().types.assignmentExpression("=", _babelCore().types.identifier(this.sentId), path.node));
      }
    },

    MetaProperty(path) {
      if (isFunctionSent(path.node)) {
        path.replaceWith(_babelCore().types.identifier(this.sentId));
      }
    }

  };
  return {
    name: "proposal-function-sent",
    inherits: _babelPluginSyntaxFunctionSent().default,
    visitor: {
      MetaProperty(path, state) {
        if (!isFunctionSent(path.node)) return;
        const fnPath = path.getFunctionParent();

        if (!fnPath.node.generator) {
          throw new Error("Parent generator function not found");
        }

        const sentId = path.scope.generateUid("function.sent");
        fnPath.traverse(yieldVisitor, {
          sentId
        });
        fnPath.node.body.body.unshift(_babelCore().types.variableDeclaration("let", [_babelCore().types.variableDeclarator(_babelCore().types.identifier(sentId), _babelCore().types.yieldExpression())]));
        (0, _babelHelperWrapFunction().default)(fnPath, state.addHelper("skipFirstGeneratorNext"));
      }

    }
  };
});

exports.default = _default;