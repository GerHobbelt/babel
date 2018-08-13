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

function _pull() {
  const data = _interopRequireDefault(require("lodash/pull"));

  _pull = function () {
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

  function isProtoKey(node) {
    return _babelCore().types.isLiteral(_babelCore().types.toComputedKey(node, node.key), {
      value: "__proto__"
    });
  }

  function isProtoAssignmentExpression(node) {
    const left = node.left;
    return _babelCore().types.isMemberExpression(left) && _babelCore().types.isLiteral(_babelCore().types.toComputedKey(left, left.property), {
      value: "__proto__"
    });
  }

  function buildDefaultsCallExpression(expr, ref, file) {
    return _babelCore().types.expressionStatement(_babelCore().types.callExpression(file.addHelper("defaults"), [ref, expr.right]));
  }

  return {
    visitor: {
      AssignmentExpression(path, file) {
        if (!isProtoAssignmentExpression(path.node)) return;
        const nodes = [];
        const left = path.node.left.object;
        const temp = path.scope.maybeGenerateMemoised(left);

        if (temp) {
          nodes.push(_babelCore().types.expressionStatement(_babelCore().types.assignmentExpression("=", temp, left)));
        }

        nodes.push(buildDefaultsCallExpression(path.node, _babelCore().types.cloneNode(temp || left), file));
        if (temp) nodes.push(_babelCore().types.cloneNode(temp));
        path.replaceWithMultiple(nodes);
      },

      ExpressionStatement(path, file) {
        const expr = path.node.expression;
        if (!_babelCore().types.isAssignmentExpression(expr, {
          operator: "="
        })) return;

        if (isProtoAssignmentExpression(expr)) {
          path.replaceWith(buildDefaultsCallExpression(expr, expr.left.object, file));
        }
      },

      ObjectExpression(path, file) {
        let proto;
        const {
          node
        } = path;

        for (const prop of node.properties) {
          if (isProtoKey(prop)) {
            proto = prop.value;
            (0, _pull().default)(node.properties, prop);
          }
        }

        if (proto) {
          const args = [_babelCore().types.objectExpression([]), proto];
          if (node.properties.length) args.push(node);
          path.replaceWith(_babelCore().types.callExpression(file.addHelper("extends"), args));
        }
      }

    }
  };
});

exports.default = _default;