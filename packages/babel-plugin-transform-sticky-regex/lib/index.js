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

function regex() {
  const data = _interopRequireWildcard(require("@gerhobbelt/babel-helper-regex"));

  regex = function () {
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var _default = (0, _babelHelperPluginUtils().declare)(api => {
  api.assertVersion(7);
  return {
    visitor: {
      RegExpLiteral(path) {
        const {
          node
        } = path;
        if (!regex().is(node, "y")) return;
        path.replaceWith(_babelCore().types.newExpression(_babelCore().types.identifier("RegExp"), [_babelCore().types.stringLiteral(node.pattern), _babelCore().types.stringLiteral(node.flags)]));
      }

    }
  };
});

exports.default = _default;