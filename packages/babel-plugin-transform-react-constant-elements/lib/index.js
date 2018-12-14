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

function _babelHelperAnnotateAsPure() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-annotate-as-pure"));

  _babelHelperAnnotateAsPure = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)((api, options) => {
  api.assertVersion(7);
  const {
    allowMutablePropsOnTags
  } = options;

  if (allowMutablePropsOnTags != null && !Array.isArray(allowMutablePropsOnTags)) {
    throw new Error(".allowMutablePropsOnTags must be an array, null, or undefined.");
  }

  const HOISTED = new WeakSet();
  const immutabilityVisitor = {
    enter(path, state) {
      const stop = () => {
        state.isImmutable = false;
        path.stop();
      };

      if (path.isJSXClosingElement()) {
        path.skip();
        return;
      }

      if (path.isJSXIdentifier({
        name: "ref"
      }) && path.parentPath.isJSXAttribute({
        name: path.node
      })) {
        return stop();
      }

      if (path.isJSXIdentifier() || path.isIdentifier() || path.isJSXMemberExpression()) {
        return;
      }

      if (!path.isImmutable()) {
        if (path.isPure()) {
          const expressionResult = path.evaluate();

          if (expressionResult.confident) {
            const {
              value
            } = expressionResult;
            const isMutable = !state.mutablePropsAllowed && value && typeof value === "object" || typeof value === "function";

            if (!isMutable) {
              path.skip();
              return;
            }
          } else if (_babelCore().types.isIdentifier(expressionResult.deopt)) {
            return;
          }
        }

        stop();
      }
    }

  };
  return {
    name: "transform-react-constant-elements",
    visitor: {
      JSXElement(path) {
        if (HOISTED.has(path.node)) return;
        HOISTED.add(path.node);
        const state = {
          isImmutable: true
        };

        if (allowMutablePropsOnTags != null) {
          let namePath = path.get("openingElement.name");

          while (namePath.isJSXMemberExpression()) {
            namePath = namePath.get("property");
          }

          const elementName = namePath.node.name;
          state.mutablePropsAllowed = allowMutablePropsOnTags.indexOf(elementName) > -1;
        }

        path.traverse(immutabilityVisitor, state);

        if (state.isImmutable) {
          const hoisted = path.hoist();

          if (hoisted) {
            (0, _babelHelperAnnotateAsPure().default)(hoisted);
          }
        }
      }

    }
  };
});

exports.default = _default;