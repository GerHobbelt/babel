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

function _babelPluginSyntaxNullishCoalescingOperator() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-nullish-coalescing-operator"));

  _babelPluginSyntaxNullishCoalescingOperator = function () {
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

var _default = (0, _babelHelperPluginUtils().declare)((api, {
  loose = false
}) => {
  api.assertVersion(7);
  return {
    name: "proposal-nullish-coalescing-operator",
    inherits: _babelPluginSyntaxNullishCoalescingOperator().default,
    visitor: {
      LogicalExpression(path) {
        const {
          node,
          scope
        } = path;

        if (node.operator !== "??") {
          return;
        }

        const ref = scope.generateUidIdentifierBasedOnNode(node.left);
        scope.push({
          id: ref
        });

        const assignment = _babelCore().types.assignmentExpression("=", _babelCore().types.cloneNode(ref), node.left);

        path.replaceWith(_babelCore().types.conditionalExpression(loose ? _babelCore().types.binaryExpression("!=", assignment, _babelCore().types.nullLiteral()) : _babelCore().types.logicalExpression("&&", _babelCore().types.binaryExpression("!==", assignment, _babelCore().types.nullLiteral()), _babelCore().types.binaryExpression("!==", _babelCore().types.cloneNode(ref), scope.buildUndefinedNode())), _babelCore().types.cloneNode(ref), node.right));
      }

    }
  };
});

exports.default = _default;