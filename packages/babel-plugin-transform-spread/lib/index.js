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

var _default = (0, _babelHelperPluginUtils().declare)((api, options) => {
  api.assertVersion(7);
  const {
    loose
  } = options;

  function getSpreadLiteral(spread, scope) {
    if (loose && !_babelCore().types.isIdentifier(spread.argument, {
      name: "arguments"
    })) {
      return spread.argument;
    } else {
      return scope.toArray(spread.argument, true);
    }
  }

  function hasSpread(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (_babelCore().types.isSpreadElement(nodes[i])) {
        return true;
      }
    }

    return false;
  }

  function push(_props, nodes) {
    if (!_props.length) return _props;
    nodes.push(_babelCore().types.arrayExpression(_props));
    return [];
  }

  function build(props, scope) {
    const nodes = [];
    let _props = [];

    for (const prop of props) {
      if (_babelCore().types.isSpreadElement(prop)) {
        _props = push(_props, nodes);
        nodes.push(getSpreadLiteral(prop, scope));
      } else {
        _props.push(prop);
      }
    }

    push(_props, nodes);
    return nodes;
  }

  return {
    visitor: {
      ArrayExpression(path) {
        const {
          node,
          scope
        } = path;
        const elements = node.elements;
        if (!hasSpread(elements)) return;
        const nodes = build(elements, scope);
        const first = nodes.shift();

        if (nodes.length === 0 && first !== elements[0].argument) {
          path.replaceWith(first);
          return;
        }

        path.replaceWith(_babelCore().types.callExpression(_babelCore().types.memberExpression(first, _babelCore().types.identifier("concat")), nodes));
      },

      CallExpression(path) {
        const {
          node,
          scope
        } = path;
        const args = node.arguments;
        if (!hasSpread(args)) return;
        const calleePath = path.get("callee");
        if (calleePath.isSuper()) return;
        let contextLiteral = scope.buildUndefinedNode();
        node.arguments = [];
        let nodes;

        if (args.length === 1 && args[0].argument.name === "arguments") {
          nodes = [args[0].argument];
        } else {
          nodes = build(args, scope);
        }

        const first = nodes.shift();

        if (nodes.length) {
          node.arguments.push(_babelCore().types.callExpression(_babelCore().types.memberExpression(first, _babelCore().types.identifier("concat")), nodes));
        } else {
          node.arguments.push(first);
        }

        const callee = node.callee;

        if (calleePath.isMemberExpression()) {
          const temp = scope.maybeGenerateMemoised(callee.object);

          if (temp) {
            callee.object = _babelCore().types.assignmentExpression("=", temp, callee.object);
            contextLiteral = temp;
          } else {
            contextLiteral = _babelCore().types.cloneNode(callee.object);
          }

          _babelCore().types.appendToMemberExpression(callee, _babelCore().types.identifier("apply"));
        } else {
          node.callee = _babelCore().types.memberExpression(node.callee, _babelCore().types.identifier("apply"));
        }

        if (_babelCore().types.isSuper(contextLiteral)) {
          contextLiteral = _babelCore().types.thisExpression();
        }

        node.arguments.unshift(_babelCore().types.cloneNode(contextLiteral));
      },

      NewExpression(path) {
        const {
          node,
          scope
        } = path;
        let args = node.arguments;
        if (!hasSpread(args)) return;
        const nodes = build(args, scope);
        const first = nodes.shift();

        if (nodes.length) {
          args = _babelCore().types.callExpression(_babelCore().types.memberExpression(first, _babelCore().types.identifier("concat")), nodes);
        } else {
          args = first;
        }

        path.replaceWith(_babelCore().types.callExpression(path.hub.addHelper("construct"), [node.callee, args]));
      }

    }
  };
});

exports.default = _default;