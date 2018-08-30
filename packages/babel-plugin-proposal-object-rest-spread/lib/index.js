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

function _babelPluginSyntaxObjectRestSpread() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-object-rest-spread"));

  _babelPluginSyntaxObjectRestSpread = function () {
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

var _default = (0, _babelHelperPluginUtils().declare)((api, opts) => {
  api.assertVersion(7);
  const {
    useBuiltIns = false,
    loose = false
  } = opts;

  if (typeof loose !== "boolean") {
    throw new Error(".loose must be a boolean, or undefined");
  }

  function getExtendsHelper(file) {
    return useBuiltIns ? _babelCore().types.memberExpression(_babelCore().types.identifier("Object"), _babelCore().types.identifier("assign")) : file.addHelper("extends");
  }

  function hasRestElement(path) {
    let foundRestElement = false;
    visitRestElements(path, () => {
      foundRestElement = true;
      path.stop();
    });
    return foundRestElement;
  }

  function visitRestElements(path, visitor) {
    path.traverse({
      Expression(path) {
        const parentType = path.parent.type;

        if (parentType == "AssignmentPattern" && path.key === "right" || parentType == "ObjectProperty" && path.parent.computed && path.key === "key") {
          path.skip();
        }
      },

      RestElement: visitor
    });
  }

  function hasSpread(node) {
    for (const prop of node.properties) {
      if (_babelCore().types.isSpreadElement(prop)) {
        return true;
      }
    }

    return false;
  }

  function extractNormalizedKeys(path) {
    const props = path.node.properties;
    const keys = [];
    let allLiteral = true;

    for (const prop of props) {
      if (_babelCore().types.isIdentifier(prop.key) && !prop.computed) {
        keys.push(_babelCore().types.stringLiteral(prop.key.name));
      } else if (_babelCore().types.isLiteral(prop.key)) {
        keys.push(_babelCore().types.stringLiteral(String(prop.key.value)));
      } else {
        keys.push(_babelCore().types.cloneNode(prop.key));
        allLiteral = false;
      }
    }

    return {
      keys,
      allLiteral
    };
  }

  function replaceImpureComputedKeys(path) {
    const impureComputedPropertyDeclarators = [];

    for (const propPath of path.get("properties")) {
      const key = propPath.get("key");

      if (propPath.node.computed && !key.isPure()) {
        const name = path.scope.generateUidBasedOnNode(key.node);

        const declarator = _babelCore().types.variableDeclarator(_babelCore().types.identifier(name), key.node);

        impureComputedPropertyDeclarators.push(declarator);
        key.replaceWith(_babelCore().types.identifier(name));
      }
    }

    return impureComputedPropertyDeclarators;
  }

  function removeUnusedExcludedKeys(path) {
    const bindings = path.getOuterBindingIdentifierPaths();
    Object.keys(bindings).forEach(bindingName => {
      const bindingParentPath = bindings[bindingName].parentPath;

      if (path.scope.getBinding(bindingName).references > 1 || !bindingParentPath.isObjectProperty()) {
        return;
      }

      bindingParentPath.remove();
    });
  }

  function createObjectSpread(path, file, objRef) {
    const props = path.get("properties");
    const last = props[props.length - 1];

    _babelCore().types.assertRestElement(last.node);

    const restElement = _babelCore().types.cloneNode(last.node);

    last.remove();
    const impureComputedPropertyDeclarators = replaceImpureComputedKeys(path);
    const {
      keys,
      allLiteral
    } = extractNormalizedKeys(path);

    if (keys.length === 0) {
      return [impureComputedPropertyDeclarators, restElement.argument, _babelCore().types.callExpression(getExtendsHelper(file), [_babelCore().types.objectExpression([]), _babelCore().types.cloneNode(objRef)])];
    }

    let keyExpression;

    if (!allLiteral) {
      keyExpression = _babelCore().types.callExpression(_babelCore().types.memberExpression(_babelCore().types.arrayExpression(keys), _babelCore().types.identifier("map")), [file.addHelper("toPropertyKey")]);
    } else {
      keyExpression = _babelCore().types.arrayExpression(keys);
    }

    return [impureComputedPropertyDeclarators, restElement.argument, _babelCore().types.callExpression(file.addHelper(`objectWithoutProperties${loose ? "Loose" : ""}`), [_babelCore().types.cloneNode(objRef), keyExpression])];
  }

  function replaceRestElement(parentPath, paramPath, i, numParams) {
    if (paramPath.isAssignmentPattern()) {
      replaceRestElement(parentPath, paramPath.get("left"), i, numParams);
      return;
    }

    if (paramPath.isArrayPattern() && hasRestElement(paramPath)) {
      const elements = paramPath.get("elements");

      for (let i = 0; i < elements.length; i++) {
        replaceRestElement(parentPath, elements[i], i, elements.length);
      }
    }

    if (paramPath.isObjectPattern() && hasRestElement(paramPath)) {
      const uid = parentPath.scope.generateUidIdentifier("ref");

      const declar = _babelCore().types.variableDeclaration("let", [_babelCore().types.variableDeclarator(paramPath.node, uid)]);

      parentPath.ensureBlock();
      parentPath.get("body").unshiftContainer("body", declar);
      paramPath.replaceWith(_babelCore().types.cloneNode(uid));
    }
  }

  return {
    inherits: _babelPluginSyntaxObjectRestSpread().default,
    visitor: {
      Function(path) {
        const params = path.get("params");

        for (let i = params.length - 1; i >= 0; i--) {
          replaceRestElement(params[i].parentPath, params[i], i, params.length);
        }
      },

      VariableDeclarator(path, file) {
        if (!path.get("id").isObjectPattern()) {
          return;
        }

        let insertionPath = path;
        const originalPath = path;
        visitRestElements(path.get("id"), path => {
          if (!path.parentPath.isObjectPattern()) {
            return;
          }

          if (originalPath.node.id.properties.length > 1 && !_babelCore().types.isIdentifier(originalPath.node.init)) {
            const initRef = path.scope.generateUidIdentifierBasedOnNode(originalPath.node.init, "ref");
            originalPath.insertBefore(_babelCore().types.variableDeclarator(initRef, originalPath.node.init));
            originalPath.replaceWith(_babelCore().types.variableDeclarator(originalPath.node.id, _babelCore().types.cloneNode(initRef)));
            return;
          }

          let ref = originalPath.node.init;
          const refPropertyPath = [];
          let kind;
          path.findParent(path => {
            if (path.isObjectProperty()) {
              refPropertyPath.unshift(path.node.key.name);
            } else if (path.isVariableDeclarator()) {
              kind = path.parentPath.node.kind;
              return true;
            }
          });

          if (refPropertyPath.length) {
            refPropertyPath.forEach(prop => {
              ref = _babelCore().types.memberExpression(ref, _babelCore().types.identifier(prop));
            });
          }

          const objectPatternPath = path.findParent(path => path.isObjectPattern());
          const [impureComputedPropertyDeclarators, argument, callExpression] = createObjectSpread(objectPatternPath, file, ref);

          if (loose) {
            removeUnusedExcludedKeys(objectPatternPath);
          }

          _babelCore().types.assertIdentifier(argument);

          insertionPath.insertBefore(impureComputedPropertyDeclarators);
          insertionPath.insertAfter(_babelCore().types.variableDeclarator(argument, callExpression));
          insertionPath = insertionPath.getSibling(insertionPath.key + 1);
          path.scope.registerBinding(kind, insertionPath);

          if (objectPatternPath.node.properties.length === 0) {
            objectPatternPath.findParent(path => path.isObjectProperty() || path.isVariableDeclarator()).remove();
          }
        });
      },

      ExportNamedDeclaration(path) {
        const declaration = path.get("declaration");
        if (!declaration.isVariableDeclaration()) return;
        const hasRest = declaration.get("declarations").some(path => hasRestElement(path.get("id")));
        if (!hasRest) return;
        const specifiers = [];

        for (const name in path.getOuterBindingIdentifiers(path)) {
          specifiers.push(_babelCore().types.exportSpecifier(_babelCore().types.identifier(name), _babelCore().types.identifier(name)));
        }

        path.replaceWith(declaration.node);
        path.insertAfter(_babelCore().types.exportNamedDeclaration(null, specifiers));
      },

      CatchClause(path) {
        const paramPath = path.get("param");
        replaceRestElement(paramPath.parentPath, paramPath);
      },

      AssignmentExpression(path, file) {
        const leftPath = path.get("left");

        if (leftPath.isObjectPattern() && hasRestElement(leftPath)) {
          const nodes = [];
          const refName = path.scope.generateUidBasedOnNode(path.node.right, "ref");
          nodes.push(_babelCore().types.variableDeclaration("var", [_babelCore().types.variableDeclarator(_babelCore().types.identifier(refName), path.node.right)]));
          const [impureComputedPropertyDeclarators, argument, callExpression] = createObjectSpread(leftPath, file, _babelCore().types.identifier(refName));

          if (impureComputedPropertyDeclarators.length > 0) {
            nodes.push(_babelCore().types.variableDeclaration("var", impureComputedPropertyDeclarators));
          }

          const nodeWithoutSpread = _babelCore().types.cloneNode(path.node);

          nodeWithoutSpread.right = _babelCore().types.identifier(refName);
          nodes.push(_babelCore().types.expressionStatement(nodeWithoutSpread));
          nodes.push(_babelCore().types.toStatement(_babelCore().types.assignmentExpression("=", argument, callExpression)));
          nodes.push(_babelCore().types.expressionStatement(_babelCore().types.identifier(refName)));
          path.replaceWithMultiple(nodes);
        }
      },

      ForXStatement(path) {
        const {
          node,
          scope
        } = path;
        const leftPath = path.get("left");
        const left = node.left;

        if (_babelCore().types.isObjectPattern(left) && hasRestElement(leftPath)) {
          const temp = scope.generateUidIdentifier("ref");
          node.left = _babelCore().types.variableDeclaration("var", [_babelCore().types.variableDeclarator(temp)]);
          path.ensureBlock();
          node.body.body.unshift(_babelCore().types.variableDeclaration("var", [_babelCore().types.variableDeclarator(left, _babelCore().types.cloneNode(temp))]));
          return;
        }

        if (!_babelCore().types.isVariableDeclaration(left)) return;
        const pattern = left.declarations[0].id;
        if (!_babelCore().types.isObjectPattern(pattern)) return;
        const key = scope.generateUidIdentifier("ref");
        node.left = _babelCore().types.variableDeclaration(left.kind, [_babelCore().types.variableDeclarator(key, null)]);
        path.ensureBlock();
        node.body.body.unshift(_babelCore().types.variableDeclaration(node.left.kind, [_babelCore().types.variableDeclarator(pattern, _babelCore().types.cloneNode(key))]));
      },

      ObjectExpression(path, file) {
        if (!hasSpread(path.node)) return;
        const args = [];
        let props = [];

        function push() {
          if (!props.length) return;
          args.push(_babelCore().types.objectExpression(props));
          props = [];
        }

        if (_babelCore().types.isSpreadElement(path.node.properties[0])) {
          args.push(_babelCore().types.objectExpression([]));
        }

        for (const prop of path.node.properties) {
          if (_babelCore().types.isSpreadElement(prop)) {
            push();
            args.push(prop.argument);
          } else {
            props.push(prop);
          }
        }

        push();
        let helper;

        if (loose) {
          helper = getExtendsHelper(file);
        } else {
          helper = file.addHelper("objectSpread");
        }

        path.replaceWith(_babelCore().types.callExpression(helper, args));
      }

    }
  };
});

exports.default = _default;