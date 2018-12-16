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

function _babelPluginSyntaxOptionalChaining() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-optional-chaining"));

  _babelPluginSyntaxOptionalChaining = function () {
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
    loose = false
  } = options;
  return {
    name: "proposal-optional-chaining",
    inherits: _babelPluginSyntaxOptionalChaining().default,
    visitor: {
      "OptionalCallExpression|OptionalMemberExpression"(path) {
        const {
          parentPath,
          scope
        } = path;
        const optionals = [];
        let optionalPath = path;

        while (optionalPath.isOptionalMemberExpression() || optionalPath.isOptionalCallExpression()) {
          const {
            node
          } = optionalPath;

          if (node.optional) {
            optionals.push(node);
          }

          if (optionalPath.isOptionalMemberExpression()) {
            optionalPath.node.type = "MemberExpression";
            optionalPath = optionalPath.get("object");
          } else if (optionalPath.isOptionalCallExpression()) {
            optionalPath.node.type = "CallExpression";
            optionalPath = optionalPath.get("callee");
          }
        }

        let replacementPath = path;

        if (parentPath.isUnaryExpression({
          operator: "delete"
        })) {
          replacementPath = parentPath;
        }

        for (let i = optionals.length - 1; i >= 0; i--) {
          const node = optionals[i];

          const isCall = _babelCore().types.isCallExpression(node);

          const replaceKey = isCall ? "callee" : "object";
          const chain = node[replaceKey];
          let ref;
          let check;

          if (loose && isCall) {
            check = ref = chain;
          } else {
            ref = scope.maybeGenerateMemoised(chain);

            if (ref) {
              check = _babelCore().types.assignmentExpression("=", _babelCore().types.cloneNode(ref), chain);
              node[replaceKey] = ref;
            } else {
              check = ref = chain;
            }
          }

          if (isCall && _babelCore().types.isMemberExpression(chain)) {
            if (loose) {
              node.callee = chain;
            } else {
              const {
                object
              } = chain;
              let context = scope.maybeGenerateMemoised(object);

              if (context) {
                chain.object = _babelCore().types.assignmentExpression("=", context, object);
              } else {
                context = object;
              }

              node.arguments.unshift(_babelCore().types.cloneNode(context));
              node.callee = _babelCore().types.memberExpression(node.callee, _babelCore().types.identifier("call"));
            }
          }

          replacementPath.replaceWith(_babelCore().types.conditionalExpression(loose ? _babelCore().types.binaryExpression("==", _babelCore().types.cloneNode(check), _babelCore().types.nullLiteral()) : _babelCore().types.logicalExpression("||", _babelCore().types.binaryExpression("===", _babelCore().types.cloneNode(check), _babelCore().types.nullLiteral()), _babelCore().types.binaryExpression("===", _babelCore().types.cloneNode(ref), scope.buildUndefinedNode())), scope.buildUndefinedNode(), replacementPath.node));
          replacementPath = replacementPath.get("alternate");
        }
      }

    }
  };
});

exports.default = _default;