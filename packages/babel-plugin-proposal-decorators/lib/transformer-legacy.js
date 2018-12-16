"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _babelCore() {
  const data = require("@gerhobbelt/babel-core");

  _babelCore = function () {
    return data;
  };

  return data;
}

const buildClassDecorator = (0, _babelCore().template)(`
  DECORATOR(CLASS_REF = INNER) || CLASS_REF;
`);
const buildClassPrototype = (0, _babelCore().template)(`
  CLASS_REF.prototype;
`);
const buildGetDescriptor = (0, _babelCore().template)(`
    Object.getOwnPropertyDescriptor(TARGET, PROPERTY);
`);
const buildGetObjectInitializer = (0, _babelCore().template)(`
    (TEMP = Object.getOwnPropertyDescriptor(TARGET, PROPERTY), (TEMP = TEMP ? TEMP.value : undefined), {
        enumerable: true,
        configurable: true,
        writable: true,
        initializer: function(){
            return TEMP;
        }
    })
`);
const WARNING_CALLS = new WeakSet();

function applyEnsureOrdering(path) {
  const decorators = (path.isClass() ? [path].concat(path.get("body.body")) : path.get("properties")).reduce((acc, prop) => acc.concat(prop.node.decorators || []), []);
  const identDecorators = decorators.filter(decorator => !_babelCore().types.isIdentifier(decorator.expression));
  if (identDecorators.length === 0) return;
  return _babelCore().types.sequenceExpression(identDecorators.map(decorator => {
    const expression = decorator.expression;
    const id = decorator.expression = path.scope.generateDeclaredUidIdentifier("dec");
    return _babelCore().types.assignmentExpression("=", id, expression);
  }).concat([path.node]));
}

function applyClassDecorators(classPath) {
  if (!hasClassDecorators(classPath.node)) return;
  const decorators = classPath.node.decorators || [];
  classPath.node.decorators = null;
  const name = classPath.scope.generateDeclaredUidIdentifier("class");
  return decorators.map(dec => dec.expression).reverse().reduce(function (acc, decorator) {
    return buildClassDecorator({
      CLASS_REF: _babelCore().types.cloneNode(name),
      DECORATOR: _babelCore().types.cloneNode(decorator),
      INNER: acc
    }).expression;
  }, classPath.node);
}

function hasClassDecorators(classNode) {
  return !!(classNode.decorators && classNode.decorators.length);
}

function applyMethodDecorators(path, state) {
  if (!hasMethodDecorators(path.node.body.body)) return;
  return applyTargetDecorators(path, state, path.node.body.body);
}

function hasMethodDecorators(body) {
  return body.some(node => node.decorators && node.decorators.length);
}

function applyObjectDecorators(path, state) {
  if (!hasMethodDecorators(path.node.properties)) return;
  return applyTargetDecorators(path, state, path.node.properties);
}

function applyTargetDecorators(path, state, decoratedProps) {
  const name = path.scope.generateDeclaredUidIdentifier(path.isClass() ? "class" : "obj");
  const exprs = decoratedProps.reduce(function (acc, node) {
    const decorators = node.decorators || [];
    node.decorators = null;
    if (decorators.length === 0) return acc;

    if (node.computed) {
      throw path.buildCodeFrameError("Computed method/property decorators are not yet supported.");
    }

    const property = _babelCore().types.isLiteral(node.key) ? node.key : _babelCore().types.stringLiteral(node.key.name);
    const target = path.isClass() && !node.static ? buildClassPrototype({
      CLASS_REF: name
    }).expression : name;

    if (_babelCore().types.isClassProperty(node, {
      static: false
    })) {
      const descriptor = path.scope.generateDeclaredUidIdentifier("descriptor");
      const initializer = node.value ? _babelCore().types.functionExpression(null, [], _babelCore().types.blockStatement([_babelCore().types.returnStatement(node.value)])) : _babelCore().types.nullLiteral();
      node.value = _babelCore().types.callExpression(state.addHelper("initializerWarningHelper"), [descriptor, _babelCore().types.thisExpression()]);
      WARNING_CALLS.add(node.value);
      acc = acc.concat([_babelCore().types.assignmentExpression("=", descriptor, _babelCore().types.callExpression(state.addHelper("applyDecoratedDescriptor"), [_babelCore().types.cloneNode(target), _babelCore().types.cloneNode(property), _babelCore().types.arrayExpression(decorators.map(dec => _babelCore().types.cloneNode(dec.expression))), _babelCore().types.objectExpression([_babelCore().types.objectProperty(_babelCore().types.identifier("configurable"), _babelCore().types.booleanLiteral(true)), _babelCore().types.objectProperty(_babelCore().types.identifier("enumerable"), _babelCore().types.booleanLiteral(true)), _babelCore().types.objectProperty(_babelCore().types.identifier("writable"), _babelCore().types.booleanLiteral(true)), _babelCore().types.objectProperty(_babelCore().types.identifier("initializer"), initializer)])]))]);
    } else {
      acc = acc.concat(_babelCore().types.callExpression(state.addHelper("applyDecoratedDescriptor"), [_babelCore().types.cloneNode(target), _babelCore().types.cloneNode(property), _babelCore().types.arrayExpression(decorators.map(dec => _babelCore().types.cloneNode(dec.expression))), _babelCore().types.isObjectProperty(node) || _babelCore().types.isClassProperty(node, {
        static: true
      }) ? buildGetObjectInitializer({
        TEMP: path.scope.generateDeclaredUidIdentifier("init"),
        TARGET: _babelCore().types.cloneNode(target),
        PROPERTY: _babelCore().types.cloneNode(property)
      }).expression : buildGetDescriptor({
        TARGET: _babelCore().types.cloneNode(target),
        PROPERTY: _babelCore().types.cloneNode(property)
      }).expression, _babelCore().types.cloneNode(target)]));
    }

    return acc;
  }, []);
  return _babelCore().types.sequenceExpression([_babelCore().types.assignmentExpression("=", _babelCore().types.cloneNode(name), path.node), _babelCore().types.sequenceExpression(exprs), _babelCore().types.cloneNode(name)]);
}

function decoratedClassToExpression({
  node,
  scope
}) {
  if (!hasClassDecorators(node) && !hasMethodDecorators(node.body.body)) {
    return;
  }

  const ref = node.id ? _babelCore().types.cloneNode(node.id) : scope.generateUidIdentifier("class");
  return _babelCore().types.variableDeclaration("let", [_babelCore().types.variableDeclarator(ref, _babelCore().types.toExpression(node))]);
}

var _default = {
  ExportDefaultDeclaration(path) {
    const decl = path.get("declaration");
    if (!decl.isClassDeclaration()) return;
    const replacement = decoratedClassToExpression(decl);

    if (replacement) {
      path.replaceWithMultiple([replacement, _babelCore().types.exportNamedDeclaration(null, [_babelCore().types.exportSpecifier(_babelCore().types.cloneNode(replacement.declarations[0].id), _babelCore().types.identifier("default"))])]);
    }
  },

  ClassDeclaration(path) {
    const replacement = decoratedClassToExpression(path);

    if (replacement) {
      path.replaceWith(replacement);
    }
  },

  ClassExpression(path, state) {
    const decoratedClass = applyEnsureOrdering(path) || applyClassDecorators(path, state) || applyMethodDecorators(path, state);
    if (decoratedClass) path.replaceWith(decoratedClass);
  },

  ObjectExpression(path, state) {
    const decoratedObject = applyEnsureOrdering(path) || applyObjectDecorators(path, state);
    if (decoratedObject) path.replaceWith(decoratedObject);
  },

  AssignmentExpression(path, state) {
    if (!WARNING_CALLS.has(path.node.right)) return;
    path.replaceWith(_babelCore().types.callExpression(state.addHelper("initializerDefineProperty"), [_babelCore().types.cloneNode(path.get("left.object").node), _babelCore().types.stringLiteral(path.get("left.property").node.name), _babelCore().types.cloneNode(path.get("right.arguments")[0].node), _babelCore().types.cloneNode(path.get("right.arguments")[1].node)]));
  }

};
exports.default = _default;