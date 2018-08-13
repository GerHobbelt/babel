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

function getName(key) {
  if (_babelCore().types.isIdentifier(key)) {
    return key.name;
  }

  return key.value.toString();
}

var _default = (0, _babelHelperPluginUtils().declare)(api => {
  api.assertVersion(7);
  return {
    visitor: {
      ObjectExpression(path) {
        const {
          node
        } = path;
        const plainProps = node.properties.filter(prop => !_babelCore().types.isSpreadElement(prop) && !prop.computed);
        const alreadySeenData = Object.create(null);
        const alreadySeenGetters = Object.create(null);
        const alreadySeenSetters = Object.create(null);

        for (const prop of plainProps) {
          const name = getName(prop.key);
          let isDuplicate = false;

          switch (prop.kind) {
            case "get":
              if (alreadySeenData[name] || alreadySeenGetters[name]) {
                isDuplicate = true;
              }

              alreadySeenGetters[name] = true;
              break;

            case "set":
              if (alreadySeenData[name] || alreadySeenSetters[name]) {
                isDuplicate = true;
              }

              alreadySeenSetters[name] = true;
              break;

            default:
              if (alreadySeenData[name] || alreadySeenGetters[name] || alreadySeenSetters[name]) {
                isDuplicate = true;
              }

              alreadySeenData[name] = true;
          }

          if (isDuplicate) {
            prop.computed = true;
            prop.key = _babelCore().types.stringLiteral(name);
          }
        }
      }

    }
  };
});

exports.default = _default;