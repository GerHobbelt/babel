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

const TRACE_ID = "__source";
const FILE_NAME_VAR = "_jsxFileName";

var _default = (0, _babelHelperPluginUtils().declare)(api => {
  api.assertVersion(7);

  function makeTrace(fileNameIdentifier, lineNumber) {
    const fileLineLiteral = lineNumber != null ? _babelCore().types.numericLiteral(lineNumber) : _babelCore().types.nullLiteral();

    const fileNameProperty = _babelCore().types.objectProperty(_babelCore().types.identifier("fileName"), fileNameIdentifier);

    const lineNumberProperty = _babelCore().types.objectProperty(_babelCore().types.identifier("lineNumber"), fileLineLiteral);

    return _babelCore().types.objectExpression([fileNameProperty, lineNumberProperty]);
  }

  const visitor = {
    JSXOpeningElement(path, state) {
      const id = _babelCore().types.jsxIdentifier(TRACE_ID);

      const location = path.container.openingElement.loc;

      if (!location) {
        return;
      }

      const attributes = path.container.openingElement.attributes;

      for (let i = 0; i < attributes.length; i++) {
        const name = attributes[i].name;

        if (name && name.name === TRACE_ID) {
          return;
        }
      }

      if (!state.fileNameIdentifier) {
        const fileName = state.filename || "";
        const fileNameIdentifier = path.scope.generateUidIdentifier(FILE_NAME_VAR);
        const scope = path.hub.getScope();

        if (scope) {
          scope.push({
            id: fileNameIdentifier,
            init: _babelCore().types.stringLiteral(fileName)
          });
        }

        state.fileNameIdentifier = fileNameIdentifier;
      }

      const trace = makeTrace(state.fileNameIdentifier, location.start.line);
      attributes.push(_babelCore().types.jsxAttribute(id, _babelCore().types.jsxExpressionContainer(trace)));
    }

  };
  return {
    visitor
  };
});

exports.default = _default;