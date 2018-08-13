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

function _babelPluginSyntaxLogicalAssignmentOperators() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-logical-assignment-operators"));

  _babelPluginSyntaxLogicalAssignmentOperators = function () {
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
  return {
    inherits: _babelPluginSyntaxLogicalAssignmentOperators().default,
    visitor: {
      AssignmentExpression(path) {
        const {
          node,
          scope
        } = path;
        const {
          operator,
          left,
          right
        } = node;

        if (operator !== "||=" && operator !== "&&=" && operator !== "??=") {
          return;
        }

        const lhs = _babelCore().types.cloneNode(left);

        if (_babelCore().types.isMemberExpression(left)) {
          const {
            object,
            property,
            computed
          } = left;
          const memo = scope.maybeGenerateMemoised(object);

          if (memo) {
            left.object = memo;
            lhs.object = _babelCore().types.assignmentExpression("=", _babelCore().types.cloneNode(memo), object);
          }

          if (computed) {
            const memo = scope.maybeGenerateMemoised(property);

            if (memo) {
              left.property = memo;
              lhs.property = _babelCore().types.assignmentExpression("=", _babelCore().types.cloneNode(memo), property);
            }
          }
        }

        path.replaceWith(_babelCore().types.logicalExpression(operator.slice(0, -1), lhs, _babelCore().types.assignmentExpression("=", left, right)));
      }

    }
  };
});

exports.default = _default;