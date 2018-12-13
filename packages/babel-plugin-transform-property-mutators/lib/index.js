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

function defineMap() {
  const data = _interopRequireWildcard(require("@gerhobbelt/babel-helper-define-map"));

  defineMap = function () {
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
      ObjectExpression(path, file) {
        const {
          node
        } = path;
        let hasAny = false;

        for (const prop of node.properties) {
          if (prop.kind === "get" || prop.kind === "set") {
            hasAny = true;
            break;
          }
        }

        if (!hasAny) return;
        const mutatorMap = {};
        node.properties = node.properties.filter(function (prop) {
          if (!prop.computed && (prop.kind === "get" || prop.kind === "set")) {
            defineMap().push(mutatorMap, prop, null, file);
            return false;
          } else {
            return true;
          }
        });
        path.replaceWith(_babelCore().types.callExpression(_babelCore().types.memberExpression(_babelCore().types.identifier("Object"), _babelCore().types.identifier("defineProperties")), [node, defineMap().toDefineObject(mutatorMap)]));
      }

    }
  };
});

exports.default = _default;