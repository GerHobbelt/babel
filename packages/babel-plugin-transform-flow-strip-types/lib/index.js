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

function _babelPluginSyntaxFlow() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-flow"));

  _babelPluginSyntaxFlow = function () {
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
  const FLOW_DIRECTIVE = "@flow";
  let skipStrip = false;
  return {
    name: "transform-flow-strip-types",
    inherits: _babelPluginSyntaxFlow().default,
    visitor: {
      Program(path, {
        file: {
          ast: {
            comments
          }
        },
        opts
      }) {
        skipStrip = false;
        let directiveFound = false;

        if (comments) {
          for (const comment of comments) {
            if (comment.value.indexOf(FLOW_DIRECTIVE) >= 0) {
              directiveFound = true;
              comment.value = comment.value.replace(FLOW_DIRECTIVE, "");

              if (!comment.value.replace(/\*/g, "").trim()) {
                comment.ignore = true;
              }
            }
          }
        }

        if (!directiveFound && opts.requireDirective) {
          skipStrip = true;
        }
      },

      ImportDeclaration(path) {
        if (skipStrip) return;
        if (!path.node.specifiers.length) return;
        let typeCount = 0;
        path.node.specifiers.forEach(({
          importKind
        }) => {
          if (importKind === "type" || importKind === "typeof") {
            typeCount++;
          }
        });

        if (typeCount === path.node.specifiers.length) {
          path.remove();
        }
      },

      Flow(path) {
        if (skipStrip) {
          throw path.buildCodeFrameError("A @flow directive is required when using Flow annotations with " + "the `requireDirective` option.");
        }

        path.remove();
      },

      ClassProperty(path) {
        if (skipStrip) return;
        path.node.variance = null;
        path.node.typeAnnotation = null;
        if (!path.node.value) path.remove();
      },

      ClassPrivateProperty(path) {
        if (skipStrip) return;
        path.node.typeAnnotation = null;
      },

      Class(path) {
        if (skipStrip) return;
        path.node.implements = null;
        path.get("body.body").forEach(child => {
          if (child.isClassProperty()) {
            child.node.typeAnnotation = null;
            if (!child.node.value) child.remove();
          }
        });
      },

      AssignmentPattern({
        node
      }) {
        if (skipStrip) return;
        node.left.optional = false;
      },

      Function({
        node
      }) {
        if (skipStrip) return;

        for (let i = 0; i < node.params.length; i++) {
          const param = node.params[i];
          param.optional = false;

          if (param.type === "AssignmentPattern") {
            param.left.optional = false;
          }
        }

        node.predicate = null;
      },

      TypeCastExpression(path) {
        if (skipStrip) return;
        let {
          node
        } = path;

        do {
          node = node.expression;
        } while (_babelCore().types.isTypeCastExpression(node));

        path.replaceWith(node);
      },

      CallExpression({
        node
      }) {
        if (skipStrip) return;
        node.typeArguments = null;
      },

      OptionalCallExpression({
        node
      }) {
        if (skipStrip) return;
        node.typeArguments = null;
      },

      NewExpression({
        node
      }) {
        if (skipStrip) return;
        node.typeArguments = null;
      }

    }
  };
});

exports.default = _default;