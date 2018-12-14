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

function _babelPluginSyntaxExportNamespaceFrom() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-export-namespace-from"));

  _babelPluginSyntaxExportNamespaceFrom = function () {
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
    name: "proposal-export-namespace-from",
    inherits: _babelPluginSyntaxExportNamespaceFrom().default,
    visitor: {
      ExportNamedDeclaration(path) {
        const {
          node,
          scope
        } = path;
        const {
          specifiers
        } = node;
        const index = _babelCore().types.isExportDefaultSpecifier(specifiers[0]) ? 1 : 0;
        if (!_babelCore().types.isExportNamespaceSpecifier(specifiers[index])) return;
        const nodes = [];

        if (index === 1) {
          nodes.push(_babelCore().types.exportNamedDeclaration(null, [specifiers.shift()], node.source));
        }

        const specifier = specifiers.shift();
        const {
          exported
        } = specifier;
        const uid = scope.generateUidIdentifier(exported.name);
        nodes.push(_babelCore().types.importDeclaration([_babelCore().types.importNamespaceSpecifier(uid)], _babelCore().types.cloneNode(node.source)), _babelCore().types.exportNamedDeclaration(null, [_babelCore().types.exportSpecifier(_babelCore().types.cloneNode(uid), exported)]));

        if (node.specifiers.length >= 1) {
          nodes.push(node);
        }

        path.replaceWithMultiple(nodes);
      }

    }
  };
});

exports.default = _default;