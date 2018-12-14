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

function _babelPluginSyntaxPipelineOperator() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-pipeline-operator"));

  _babelPluginSyntaxPipelineOperator = function () {
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
    name: "proposal-pipeline-operator",
    inherits: _babelPluginSyntaxPipelineOperator().default,
    visitor: {
      BinaryExpression(path) {
        const {
          scope
        } = path;
        const {
          node
        } = path;
        const {
          operator,
          left
        } = node;
        let {
          right
        } = node;
        if (operator !== "|>") return;
        let optimizeArrow = _babelCore().types.isArrowFunctionExpression(right) && _babelCore().types.isExpression(right.body) && !right.async && !right.generator;
        let param;

        if (optimizeArrow) {
          const {
            params
          } = right;

          if (params.length === 1 && _babelCore().types.isIdentifier(params[0])) {
            param = params[0];
          } else if (params.length > 0) {
            optimizeArrow = false;
          }
        } else if (_babelCore().types.isIdentifier(right, {
          name: "eval"
        })) {
          right = _babelCore().types.sequenceExpression([_babelCore().types.numericLiteral(0), right]);
        }

        if (optimizeArrow && !param) {
          path.replaceWith(_babelCore().types.sequenceExpression([left, right.body]));
          return;
        }

        const placeholder = scope.generateUidIdentifierBasedOnNode(param || left);
        scope.push({
          id: placeholder
        });

        if (param) {
          path.get("right").scope.rename(param.name, placeholder.name);
        }

        const call = optimizeArrow ? right.body : _babelCore().types.callExpression(right, [_babelCore().types.cloneNode(placeholder)]);
        path.replaceWith(_babelCore().types.sequenceExpression([_babelCore().types.assignmentExpression("=", _babelCore().types.cloneNode(placeholder), left), call]));
      }

    }
  };
});

exports.default = _default;