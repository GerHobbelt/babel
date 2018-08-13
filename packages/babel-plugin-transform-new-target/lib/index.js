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

var _default = (0, _babelHelperPluginUtils().declare)(api => {
  api.assertVersion(7);
  return {
    name: "transform-new-target",
    visitor: {
      MetaProperty(path) {
        const meta = path.get("meta");
        const property = path.get("property");
        const {
          scope
        } = path;

        if (meta.isIdentifier({
          name: "new"
        }) && property.isIdentifier({
          name: "target"
        })) {
          const func = path.findParent(path => {
            if (path.isClass()) return true;

            if (path.isFunction() && !path.isArrowFunctionExpression()) {
              if (path.isClassMethod({
                kind: "constructor"
              })) {
                return false;
              }

              return true;
            }

            return false;
          });

          if (!func) {
            throw path.buildCodeFrameError("new.target must be under a (non-arrow) function or a class.");
          }

          const {
            node
          } = func;

          if (!node.id) {
            if (func.isMethod()) {
              path.replaceWith(scope.buildUndefinedNode());
              return;
            }

            node.id = scope.generateUidIdentifier("target");
          }

          const constructor = _babelCore().types.memberExpression(_babelCore().types.thisExpression(), _babelCore().types.identifier("constructor"));

          if (func.isClass()) {
            path.replaceWith(constructor);
            return;
          }

          path.replaceWith(_babelCore().types.conditionalExpression(_babelCore().types.binaryExpression("instanceof", _babelCore().types.thisExpression(), _babelCore().types.cloneNode(node.id)), constructor, scope.buildUndefinedNode()));
        }
      }

    }
  };
});

exports.default = _default;