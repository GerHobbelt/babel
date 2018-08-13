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

function _babelHelperSimpleAccess() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-simple-access"));

  _babelHelperSimpleAccess = function () {
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

var _default = (0, _babelHelperPluginUtils().declare)((api, options) => {
  api.assertVersion(7);
  const {
    loose,
    strictNamespace = false,
    mjsStrictNamespace = true,
    allowTopLevelThis,
    strict,
    strictMode,
    noInterop,
    lazy = false,
    allowCommonJSExports = true
  } = options;

  if (typeof lazy !== "boolean" && typeof lazy !== "function" && (!Array.isArray(lazy) || !lazy.every(item => typeof item === "string"))) {
    throw new Error(`.lazy must be a boolean, array of strings, or a function`);
  }

  if (typeof strictNamespace !== "boolean") {
    throw new Error(`.strictNamespace must be a boolean, or undefined`);
  }

  if (typeof mjsStrictNamespace !== "boolean") {
    throw new Error(`.mjsStrictNamespace must be a boolean, or undefined`);
  }

  const getAssertion = localName => _babelCore().template.expression.ast`
    (function(){
      throw new Error(
        "The CommonJS '" + "${localName}" + "' variable is not available in ES6 modules." +
        "Consider setting setting sourceType:script or sourceType:unambiguous in your " +
        "Babel config for this file.");
    })()
  `;

  const moduleExportsVisitor = {
    ReferencedIdentifier(path) {
      const localName = path.node.name;
      if (localName !== "module" && localName !== "exports") return;
      const localBinding = path.scope.getBinding(localName);
      const rootBinding = this.scope.getBinding(localName);

      if (rootBinding !== localBinding || path.parentPath.isObjectProperty({
        value: path.node
      }) && path.parentPath.parentPath.isObjectPattern() || path.parentPath.isAssignmentExpression({
        left: path.node
      }) || path.isAssignmentExpression({
        left: path.node
      })) {
        return;
      }

      path.replaceWith(getAssertion(localName));
    },

    AssignmentExpression(path) {
      const left = path.get("left");

      if (left.isIdentifier()) {
        const localName = path.node.name;
        if (localName !== "module" && localName !== "exports") return;
        const localBinding = path.scope.getBinding(localName);
        const rootBinding = this.scope.getBinding(localName);
        if (rootBinding !== localBinding) return;
        const right = path.get("right");
        right.replaceWith(_babelCore().types.sequenceExpression([right.node, getAssertion(localName)]));
      } else if (left.isPattern()) {
        const ids = left.getOuterBindingIdentifiers();
        const localName = Object.keys(ids).filter(localName => {
          if (localName !== "module" && localName !== "exports") return false;
          return this.scope.getBinding(localName) === path.scope.getBinding(localName);
        })[0];

        if (localName) {
          const right = path.get("right");
          right.replaceWith(_babelCore().types.sequenceExpression([right.node, getAssertion(localName)]));
        }
      }
    }

  };
  return {
    visitor: {
      Program: {
        exit(path, state) {
          if (!(0, _babelHelperModuleTransforms().isModule)(path)) return;
          path.scope.rename("exports");
          path.scope.rename("module");
          path.scope.rename("require");
          path.scope.rename("__filename");
          path.scope.rename("__dirname");

          if (!allowCommonJSExports) {
            (0, _babelHelperSimpleAccess().default)(path, new Set(["module", "exports"]));
            path.traverse(moduleExportsVisitor, {
              scope: path.scope
            });
          }

          let moduleName = this.getModuleName();
          if (moduleName) moduleName = _babelCore().types.stringLiteral(moduleName);
          const {
            meta,
            headers
          } = (0, _babelHelperModuleTransforms().rewriteModuleStatementsAndPrepareHeader)(path, {
            exportName: "exports",
            loose,
            strict,
            strictMode,
            allowTopLevelThis,
            noInterop,
            lazy,
            esNamespaceOnly: typeof state.filename === "string" && /\.mjs$/.test(state.filename) ? mjsStrictNamespace : strictNamespace
          });

          for (const [source, metadata] of meta.source) {
            const loadExpr = _babelCore().types.callExpression(_babelCore().types.identifier("require"), [_babelCore().types.stringLiteral(source)]);

            let header;

            if ((0, _babelHelperModuleTransforms().isSideEffectImport)(metadata)) {
              if (metadata.lazy) throw new Error("Assertion failure");
              header = _babelCore().types.expressionStatement(loadExpr);
            } else {
              const init = (0, _babelHelperModuleTransforms().wrapInterop)(path, loadExpr, metadata.interop) || loadExpr;

              if (metadata.lazy) {
                header = _babelCore().template.ast`
                  function ${metadata.name}() {
                    const data = ${init};
                    ${metadata.name} = function(){ return data; };
                    return data;
                  }
                `;
              } else {
                header = _babelCore().template.ast`
                  var ${metadata.name} = ${init};
                `;
              }
            }

            header.loc = metadata.loc;
            headers.push(header);
            headers.push(...(0, _babelHelperModuleTransforms().buildNamespaceInitStatements)(meta, metadata, loose));
          }

          (0, _babelHelperModuleTransforms().ensureStatementsHoisted)(headers);
          path.unshiftContainer("body", headers);
        }

      }
    }
  };
});

exports.default = _default;