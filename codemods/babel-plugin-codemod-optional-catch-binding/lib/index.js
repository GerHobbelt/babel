"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _babelPluginSyntaxOptionalCatchBinding() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-optional-catch-binding"));

  _babelPluginSyntaxOptionalCatchBinding = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default({
  types: t
}) {
  return {
    inherits: _babelPluginSyntaxOptionalCatchBinding().default,
    visitor: {
      CatchClause(path) {
        if (path.node.param === null || !t.isIdentifier(path.node.param)) {
          return;
        }

        const binding = path.scope.getOwnBinding(path.node.param.name);

        if (binding.constantViolations.length > 0) {
          return;
        }

        if (!binding.referenced) {
          const paramPath = path.get("param");
          paramPath.remove();
        }
      }

    }
  };
}