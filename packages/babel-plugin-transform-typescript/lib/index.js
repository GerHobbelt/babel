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

function _babelPluginSyntaxTypescript() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-typescript"));

  _babelPluginSyntaxTypescript = function () {
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

var _enum = _interopRequireDefault(require("./enum"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isInType(path) {
  switch (path.parent.type) {
    case "TSTypeReference":
    case "TSQualifiedName":
    case "TSExpressionWithTypeArguments":
    case "TSTypeQuery":
      return true;

    default:
      return false;
  }
}

var _default = (0, _babelHelperPluginUtils().declare)((api, {
  jsxPragma = "React"
}) => {
  api.assertVersion(7);
  return {
    inherits: _babelPluginSyntaxTypescript().default,
    visitor: {
      Pattern: visitPattern,
      Identifier: visitPattern,
      RestElement: visitPattern,

      Program(path, state) {
        state.programPath = path;

        for (const stmt of path.get("body")) {
          if (_babelCore().types.isImportDeclaration(stmt)) {
            if (stmt.node.specifiers.length === 0) {
              return;
            }

            let allElided = true;
            const importsToRemove = [];

            for (const specifier of stmt.node.specifiers) {
              const binding = stmt.scope.getBinding(specifier.local.name);

              if (binding && isImportTypeOnly(binding, state.programPath)) {
                importsToRemove.push(binding.path);
              } else {
                allElided = false;
              }
            }

            if (allElided) {
              stmt.remove();
            } else {
              for (const importPath of importsToRemove) {
                importPath.remove();
              }
            }
          }
        }
      },

      TSDeclareFunction(path) {
        path.remove();
      },

      TSDeclareMethod(path) {
        path.remove();
      },

      VariableDeclaration(path) {
        if (path.node.declare) path.remove();
      },

      VariableDeclarator({
        node
      }) {
        if (node.definite) node.definite = null;
      },

      ClassMethod(path) {
        const {
          node
        } = path;
        if (node.accessibility) node.accessibility = null;
        if (node.abstract) node.abstract = null;
        if (node.optional) node.optional = null;

        if (node.kind !== "constructor") {
          return;
        }

        const parameterProperties = [];

        for (const param of node.params) {
          if (param.type === "TSParameterProperty") {
            parameterProperties.push(param.parameter);
          }
        }

        if (!parameterProperties.length) {
          return;
        }

        const assigns = parameterProperties.map(p => {
          let name;

          if (_babelCore().types.isIdentifier(p)) {
            name = p.name;
          } else if (_babelCore().types.isAssignmentPattern(p) && _babelCore().types.isIdentifier(p.left)) {
            name = p.left.name;
          } else {
            throw path.buildCodeFrameError("Parameter properties can not be destructuring patterns.");
          }

          const assign = _babelCore().types.assignmentExpression("=", _babelCore().types.memberExpression(_babelCore().types.thisExpression(), _babelCore().types.identifier(name)), _babelCore().types.identifier(name));

          return _babelCore().types.expressionStatement(assign);
        });
        const statements = node.body.body;
        const first = statements[0];

        const startsWithSuperCall = first !== undefined && _babelCore().types.isExpressionStatement(first) && _babelCore().types.isCallExpression(first.expression) && _babelCore().types.isSuper(first.expression.callee);

        node.body.body = startsWithSuperCall ? [first, ...assigns, ...statements.slice(1)] : [...assigns, ...statements];
      },

      TSParameterProperty(path) {
        path.replaceWith(path.node.parameter);
      },

      ClassProperty(path) {
        const {
          node
        } = path;
        if (node.accessibility) node.accessibility = null;
        if (node.abstract) node.abstract = null;
        if (node.readonly) node.readonly = null;
        if (node.optional) node.optional = null;
        if (node.definite) node.definite = null;
        if (node.typeAnnotation) node.typeAnnotation = null;
      },

      TSIndexSignature(path) {
        path.remove();
      },

      ClassDeclaration(path) {
        const {
          node
        } = path;

        if (node.declare) {
          path.remove();
          return;
        }

        if (node.abstract) node.abstract = null;
      },

      Class(path) {
        const {
          node
        } = path;
        if (node.typeParameters) node.typeParameters = null;
        if (node.superTypeParameters) node.superTypeParameters = null;
        if (node.implements) node.implements = null;
        path.get("body.body").forEach(child => {
          if (child.isClassProperty()) {
            child.node.typeAnnotation = null;

            if (!child.node.value && !child.node.decorators) {
              child.remove();
            }
          }
        });
      },

      Function({
        node
      }) {
        if (node.typeParameters) node.typeParameters = null;
        if (node.returnType) node.returnType = null;
        const p0 = node.params[0];

        if (p0 && _babelCore().types.isIdentifier(p0) && p0.name === "this") {
          node.params.shift();
        }
      },

      TSModuleDeclaration(path) {
        if (!path.node.declare && path.node.id.type !== "StringLiteral") {
          throw path.buildCodeFrameError("Namespaces are not supported.");
        }

        path.remove();
      },

      TSInterfaceDeclaration(path) {
        path.remove();
      },

      TSTypeAliasDeclaration(path) {
        path.remove();
      },

      TSEnumDeclaration(path) {
        (0, _enum.default)(path, _babelCore().types);
      },

      TSImportEqualsDeclaration(path) {
        throw path.buildCodeFrameError("`import =` is not supported by @gerhobbelt/babel-plugin-transform-typescript\n" + "Please consider using " + "`import <moduleName> from '<moduleName>';` alongside " + "Typescript's --allowSyntheticDefaultImports option.");
      },

      TSExportAssignment(path) {
        throw path.buildCodeFrameError("`export =` is not supported by @gerhobbelt/babel-plugin-transform-typescript\n" + "Please consider using `export <value>;`.");
      },

      TSTypeAssertion(path) {
        path.replaceWith(path.node.expression);
      },

      TSAsExpression(path) {
        path.replaceWith(path.node.expression);
      },

      TSNonNullExpression(path) {
        path.replaceWith(path.node.expression);
      },

      CallExpression(path) {
        path.node.typeParameters = null;
      },

      NewExpression(path) {
        path.node.typeParameters = null;
      },

      JSXOpeningElement(path) {
        path.node.typeParameters = null;
      },

      TaggedTemplateExpression(path) {
        path.node.typeParameters = null;
      }

    }
  };

  function visitPattern({
    node
  }) {
    if (node.typeAnnotation) node.typeAnnotation = null;
    if (_babelCore().types.isIdentifier(node) && node.optional) node.optional = null;
  }

  function isImportTypeOnly(binding, programPath) {
    for (const path of binding.referencePaths) {
      if (!isInType(path)) {
        return false;
      }
    }

    if (binding.identifier.name !== jsxPragma) {
      return true;
    }

    let sourceFileHasJsx = false;
    programPath.traverse({
      JSXElement() {
        sourceFileHasJsx = true;
      },

      JSXFragment() {
        sourceFileHasJsx = true;
      }

    });
    return !sourceFileHasJsx;
  }
});

exports.default = _default;