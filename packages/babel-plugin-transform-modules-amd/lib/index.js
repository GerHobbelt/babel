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

function _babelHelperModuleTransforms() {
  const data = require("@gerhobbelt/babel-helper-module-transforms");

  _babelHelperModuleTransforms = function () {
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

const buildWrapper = (0, _babelCore().template)(`
  define(MODULE_NAME, AMD_ARGUMENTS, function(IMPORT_NAMES) {
  })
`);

var _default = (0, _babelHelperPluginUtils().declare)((api, options) => {
  api.assertVersion(7);
  const {
    loose,
    allowTopLevelThis,
    strict,
    strictMode,
    noInterop
  } = options;
  return {
    name: "transform-modules-amd",
    visitor: {
      Program: {
        exit(path) {
          if (!(0, _babelHelperModuleTransforms().isModule)(path)) return;
          let moduleName = this.getModuleName();
          if (moduleName) moduleName = _babelCore().types.stringLiteral(moduleName);
          const {
            meta,
            headers
          } = (0, _babelHelperModuleTransforms().rewriteModuleStatementsAndPrepareHeader)(path, {
            loose,
            strict,
            strictMode,
            allowTopLevelThis,
            noInterop
          });
          const amdArgs = [];
          const importNames = [];

          if ((0, _babelHelperModuleTransforms().hasExports)(meta)) {
            amdArgs.push(_babelCore().types.stringLiteral("exports"));
            importNames.push(_babelCore().types.identifier(meta.exportName));
          }

          for (const [source, metadata] of meta.source) {
            amdArgs.push(_babelCore().types.stringLiteral(source));
            importNames.push(_babelCore().types.identifier(metadata.name));

            if (!(0, _babelHelperModuleTransforms().isSideEffectImport)(metadata)) {
              const interop = (0, _babelHelperModuleTransforms().wrapInterop)(path, _babelCore().types.identifier(metadata.name), metadata.interop);

              if (interop) {
                const header = _babelCore().types.expressionStatement(_babelCore().types.assignmentExpression("=", _babelCore().types.identifier(metadata.name), interop));

                header.loc = metadata.loc;
                headers.push(header);
              }
            }

            headers.push(...(0, _babelHelperModuleTransforms().buildNamespaceInitStatements)(meta, metadata, loose));
          }

          (0, _babelHelperModuleTransforms().ensureStatementsHoisted)(headers);
          path.unshiftContainer("body", headers);
          const {
            body,
            directives
          } = path.node;
          path.node.directives = [];
          path.node.body = [];
          const amdWrapper = path.pushContainer("body", [buildWrapper({
            MODULE_NAME: moduleName,
            AMD_ARGUMENTS: _babelCore().types.arrayExpression(amdArgs),
            IMPORT_NAMES: importNames
          })])[0];
          const amdFactory = amdWrapper.get("expression.arguments").filter(arg => arg.isFunctionExpression())[0].get("body");
          amdFactory.pushContainer("directives", directives);
          amdFactory.pushContainer("body", body);
        }

      }
    }
  };
});

exports.default = _default;