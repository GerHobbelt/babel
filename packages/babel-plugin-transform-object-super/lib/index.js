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

function _babelHelperReplaceSupers() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-replace-supers"));

  _babelHelperReplaceSupers = function () {
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

function replacePropertySuper(path, getObjectRef, file) {
  const replaceSupers = new (_babelHelperReplaceSupers().default)({
    getObjectRef: getObjectRef,
    methodPath: path,
    file: file
  });
  replaceSupers.replace();
}

var _default = (0, _babelHelperPluginUtils().declare)(api => {
  api.assertVersion(7);
  return {
    name: "transform-object-super",
    visitor: {
      ObjectExpression(path, state) {
        let objectRef;

        const getObjectRef = () => objectRef = objectRef || path.scope.generateUidIdentifier("obj");

        path.get("properties").forEach(propPath => {
          if (!propPath.isMethod()) return;
          replacePropertySuper(propPath, getObjectRef, state);
        });

        if (objectRef) {
          path.scope.push({
            id: _babelCore().types.cloneNode(objectRef)
          });
          path.replaceWith(_babelCore().types.assignmentExpression("=", _babelCore().types.cloneNode(objectRef), path.node));
        }
      }

    }
  };
});

exports.default = _default;