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
  const data = require("path");

  _path = function () {
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

const buildPrerequisiteAssignment = (0, _babelCore().template)(`
  GLOBAL_REFERENCE = GLOBAL_REFERENCE || {}
`);
const buildWrapper = (0, _babelCore().template)(`
  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define(MODULE_NAME, AMD_ARGUMENTS, factory);
    } else if (typeof exports !== "undefined") {
      factory(COMMONJS_ARGUMENTS);
    } else {
      var mod = { exports: {} };
      factory(BROWSER_ARGUMENTS);

      GLOBAL_TO_ASSIGN;
    }
  })(this, function(IMPORT_NAMES) {
  })
`);

var _default = (0, _babelHelperPluginUtils().declare)((api, options) => {
  api.assertVersion(7);
  const {
    globals,
    exactGlobals,
    loose,
    allowTopLevelThis,
    strict,
    strictMode,
    noInterop
  } = options;

  function buildBrowserInit(browserGlobals, exactGlobals, filename, moduleName) {
    const moduleNameOrBasename = moduleName ? moduleName.value : (0, _path().basename)(filename, (0, _path().extname)(filename));

    let globalToAssign = _babelCore().types.memberExpression(_babelCore().types.identifier("global"), _babelCore().types.identifier(_babelCore().types.toIdentifier(moduleNameOrBasename)));

    let initAssignments = [];

    if (exactGlobals) {
      const globalName = browserGlobals[moduleNameOrBasename];

      if (globalName) {
        initAssignments = [];
        const members = globalName.split(".");
        globalToAssign = members.slice(1).reduce((accum, curr) => {
          initAssignments.push(buildPrerequisiteAssignment({
            GLOBAL_REFERENCE: _babelCore().types.cloneNode(accum)
          }));
          return _babelCore().types.memberExpression(accum, _babelCore().types.identifier(curr));
        }, _babelCore().types.memberExpression(_babelCore().types.identifier("global"), _babelCore().types.identifier(members[0])));
      }
    }

    initAssignments.push(_babelCore().types.expressionStatement(_babelCore().types.assignmentExpression("=", globalToAssign, _babelCore().types.memberExpression(_babelCore().types.identifier("mod"), _babelCore().types.identifier("exports")))));
    return initAssignments;
  }

  function buildBrowserArg(browserGlobals, exactGlobals, source) {
    let memberExpression;

    if (exactGlobals) {
      const globalRef = browserGlobals[source];

      if (globalRef) {
        memberExpression = globalRef.split(".").reduce((accum, curr) => _babelCore().types.memberExpression(accum, _babelCore().types.identifier(curr)), _babelCore().types.identifier("global"));
      } else {
        memberExpression = _babelCore().types.memberExpression(_babelCore().types.identifier("global"), _babelCore().types.identifier(_babelCore().types.toIdentifier(source)));
      }
    } else {
      const requireName = (0, _path().basename)(source, (0, _path().extname)(source));
      const globalName = browserGlobals[requireName] || requireName;
      memberExpression = _babelCore().types.memberExpression(_babelCore().types.identifier("global"), _babelCore().types.identifier(_babelCore().types.toIdentifier(globalName)));
    }

    return memberExpression;
  }

  return {
    name: "transform-modules-umd",
    visitor: {
      Program: {
        exit(path) {
          if (!(0, _babelHelperModuleTransforms().isModule)(path)) return;
          const browserGlobals = globals || {};
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
          const commonjsArgs = [];
          const browserArgs = [];
          const importNames = [];

          if ((0, _babelHelperModuleTransforms().hasExports)(meta)) {
            amdArgs.push(_babelCore().types.stringLiteral("exports"));
            commonjsArgs.push(_babelCore().types.identifier("exports"));
            browserArgs.push(_babelCore().types.memberExpression(_babelCore().types.identifier("mod"), _babelCore().types.identifier("exports")));
            importNames.push(_babelCore().types.identifier(meta.exportName));
          }

          for (const [source, metadata] of meta.source) {
            amdArgs.push(_babelCore().types.stringLiteral(source));
            commonjsArgs.push(_babelCore().types.callExpression(_babelCore().types.identifier("require"), [_babelCore().types.stringLiteral(source)]));
            browserArgs.push(buildBrowserArg(browserGlobals, exactGlobals, source));
            importNames.push(_babelCore().types.identifier(metadata.name));

            if (!(0, _babelHelperModuleTransforms().isSideEffectImport)(metadata)) {
              const interop = (0, _babelHelperModuleTransforms().wrapInterop)(path, _babelCore().types.identifier(metadata.name), metadata.interop);

              if (interop) {
                const header = _babelCore().types.expressionStatement(_babelCore().types.assignmentExpression("=", _babelCore().types.identifier(metadata.name), interop));

                header.loc = meta.loc;
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
          const umdWrapper = path.pushContainer("body", [buildWrapper({
            MODULE_NAME: moduleName,
            AMD_ARGUMENTS: _babelCore().types.arrayExpression(amdArgs),
            COMMONJS_ARGUMENTS: commonjsArgs,
            BROWSER_ARGUMENTS: browserArgs,
            IMPORT_NAMES: importNames,
            GLOBAL_TO_ASSIGN: buildBrowserInit(browserGlobals, exactGlobals, this.filename || "unknown", moduleName)
          })])[0];
          const umdFactory = umdWrapper.get("expression.arguments")[1].get("body");
          umdFactory.pushContainer("directives", directives);
          umdFactory.pushContainer("body", body);
        }

      }
    }
  };
});

exports.default = _default;