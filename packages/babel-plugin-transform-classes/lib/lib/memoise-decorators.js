"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _babelCore() {
  const data = require("@gerhobbelt/babel-core");

  _babelCore = function () {
    return data;
  };

  return data;
}

function _default(decorators, scope) {
  for (const decorator of decorators) {
    const expression = decorator.expression;
    if (!_babelCore().types.isMemberExpression(expression)) continue;
    const temp = scope.maybeGenerateMemoised(expression.object);
    let ref;
    const nodes = [];

    if (temp) {
      ref = temp;
      nodes.push(_babelCore().types.assignmentExpression("=", temp, expression.object));
    } else {
      ref = expression.object;
    }

    nodes.push(_babelCore().types.callExpression(_babelCore().types.memberExpression(_babelCore().types.memberExpression(ref, expression.property, expression.computed), _babelCore().types.identifier("bind")), [ref]));

    if (nodes.length === 1) {
      decorator.expression = nodes[0];
    } else {
      decorator.expression = _babelCore().types.sequenceExpression(nodes);
    }
  }

  return decorators;
}