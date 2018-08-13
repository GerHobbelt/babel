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

const TRACE_ID = "__self";

var _default = (0, _babelHelperPluginUtils().declare)(api => {
  api.assertVersion(7);
  const visitor = {
    JSXOpeningElement({
      node
    }) {
      const id = _babelCore().types.jsxIdentifier(TRACE_ID);

      const trace = _babelCore().types.thisExpression();

      node.attributes.push(_babelCore().types.jsxAttribute(id, _babelCore().types.jsxExpressionContainer(trace)));
    }

  };
  return {
    visitor
  };
});

exports.default = _default;