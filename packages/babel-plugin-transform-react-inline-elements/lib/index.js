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

function _babelHelperBuilderReactJsx() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-builder-react-jsx"));

  _babelHelperBuilderReactJsx = function () {
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

  function hasRefOrSpread(attrs) {
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      if (_babelCore().types.isJSXSpreadAttribute(attr)) return true;
      if (isJSXAttributeOfName(attr, "ref")) return true;
    }

    return false;
  }

  function isJSXAttributeOfName(attr, name) {
    return _babelCore().types.isJSXAttribute(attr) && _babelCore().types.isJSXIdentifier(attr.name, {
      name: name
    });
  }

  const visitor = (0, _babelHelperBuilderReactJsx().default)({
    filter(node) {
      return node.openingElement && !hasRefOrSpread(node.openingElement.attributes);
    },

    pre(state) {
      const tagName = state.tagName;
      const args = state.args;

      if (_babelCore().types.react.isCompatTag(tagName)) {
        args.push(_babelCore().types.stringLiteral(tagName));
      } else {
        args.push(state.tagExpr);
      }
    },

    post(state, pass) {
      state.callee = pass.addHelper("jsx");
      const props = state.args[1];
      let hasKey = false;

      if (_babelCore().types.isObjectExpression(props)) {
        const keyIndex = props.properties.findIndex(prop => _babelCore().types.isIdentifier(prop.key, {
          name: "key"
        }));

        if (keyIndex > -1) {
          state.args.splice(2, 0, props.properties[keyIndex].value);
          props.properties.splice(keyIndex, 1);
          hasKey = true;
        }
      } else if (_babelCore().types.isNullLiteral(props)) {
        state.args.splice(1, 1, _babelCore().types.objectExpression([]));
      }

      if (!hasKey && state.args.length > 2) {
        state.args.splice(2, 0, _babelCore().types.unaryExpression("void", _babelCore().types.numericLiteral(0)));
      }
    }

  });
  return {
    name: "transform-react-inline-elements",
    visitor
  };
});

exports.default = _default;