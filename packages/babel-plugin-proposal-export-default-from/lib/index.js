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

function _babelPluginSyntaxExportDefaultFrom() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-export-default-from"));

  _babelPluginSyntaxExportDefaultFrom = function () {
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
    name: "proposal-export-default-from",
    inherits: _babelPluginSyntaxExportDefaultFrom().default,
    visitor: {
      ExportNamedDeclaration(path) {
        const {
          node,
          scope
        } = path;
        const {
          specifiers
        } = node;
        if (!_babelCore().types.isExportDefaultSpecifier(specifiers[0])) return;
        const specifier = specifiers.shift();
        const {
          exported
        } = specifier;
        const uid = scope.generateUidIdentifier(exported.name);
        const nodes = [_babelCore().types.importDeclaration([_babelCore().types.importDefaultSpecifier(uid)], _babelCore().types.cloneNode(node.source)), _babelCore().types.exportNamedDeclaration(null, [_babelCore().types.exportSpecifier(_babelCore().types.cloneNode(uid), exported)])];

        if (specifiers.length >= 1) {
          nodes.push(node);
        }

        path.replaceWithMultiple(nodes);
      }

    }
  };
});

exports.default = _default;