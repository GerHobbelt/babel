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

function _path() {
  const data = _interopRequireDefault(require("path"));

  _path = function () {
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

  function addDisplayName(id, call) {
    const props = call.arguments[0].properties;
    let safe = true;

    for (let i = 0; i < props.length; i++) {
      const prop = props[i];

      const key = _babelCore().types.toComputedKey(prop);

      if (_babelCore().types.isLiteral(key, {
        value: "displayName"
      })) {
        safe = false;
        break;
      }
    }

    if (safe) {
      props.unshift(_babelCore().types.objectProperty(_babelCore().types.identifier("displayName"), _babelCore().types.stringLiteral(id)));
    }
  }

  const isCreateClassCallExpression = _babelCore().types.buildMatchMemberExpression("React.createClass");

  const isCreateClassAddon = callee => callee.name === "createReactClass";

  function isCreateClass(node) {
    if (!node || !_babelCore().types.isCallExpression(node)) return false;

    if (!isCreateClassCallExpression(node.callee) && !isCreateClassAddon(node.callee)) {
      return false;
    }

    const args = node.arguments;
    if (args.length !== 1) return false;
    const first = args[0];
    if (!_babelCore().types.isObjectExpression(first)) return false;
    return true;
  }

  return {
    name: "transform-react-display-name",
    visitor: {
      ExportDefaultDeclaration({
        node
      }, state) {
        if (isCreateClass(node.declaration)) {
          const filename = state.filename || "unknown";

          let displayName = _path().default.basename(filename, _path().default.extname(filename));

          if (displayName === "index") {
            displayName = _path().default.basename(_path().default.dirname(filename));
          }

          addDisplayName(displayName, node.declaration);
        }
      },

      CallExpression(path) {
        const {
          node
        } = path;
        if (!isCreateClass(node)) return;
        let id;
        path.find(function (path) {
          if (path.isAssignmentExpression()) {
            id = path.node.left;
          } else if (path.isObjectProperty()) {
            id = path.node.key;
          } else if (path.isVariableDeclarator()) {
            id = path.node.id;
          } else if (path.isStatement()) {
            return true;
          }

          if (id) return true;
        });
        if (!id) return;

        if (_babelCore().types.isMemberExpression(id)) {
          id = id.property;
        }

        if (_babelCore().types.isIdentifier(id)) {
          addDisplayName(id.name, node);
        }
      }

    }
  };
});

exports.default = _default;