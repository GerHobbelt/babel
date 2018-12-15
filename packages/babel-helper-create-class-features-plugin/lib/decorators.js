"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasOwnDecorators = hasOwnDecorators;
exports.hasDecorators = hasDecorators;
exports.buildDecoratedClass = buildDecoratedClass;

function _babelCore() {
  const data = require("@gerhobbelt/babel-core");

  _babelCore = function () {
    return data;
  };

  return data;
}

function _babelHelperReplaceSupers() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-replace-supers"));

  _babelHelperReplaceSupers = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hasOwnDecorators(node) {
  return !!(node.decorators && node.decorators.length);
}

function hasDecorators(node) {
  return hasOwnDecorators(node) || node.body.body.some(hasOwnDecorators);
}

function prop(key, value) {
  if (!value) return null;
  return _babelCore().types.objectProperty(_babelCore().types.identifier(key), value);
}

function value(body, params = [], async, generator) {
  const method = _babelCore().types.objectMethod("method", _babelCore().types.identifier("value"), params, body);

  method.async = !!async;
  method.generator = !!generator;
  return method;
}

function takeDecorators(node) {
  let result;

  if (node.decorators && node.decorators.length > 0) {
    result = _babelCore().types.arrayExpression(node.decorators.map(decorator => decorator.expression));
  }

  node.decorators = undefined;
  return result;
}

function getKey(node) {
  if (node.computed) {
    return node.key;
  } else if (_babelCore().types.isIdentifier(node.key)) {
    return _babelCore().types.stringLiteral(node.key.name);
  } else {
    return _babelCore().types.stringLiteral(String(node.key.value));
  }
}

function extractElementDescriptor(classRef, superRef, path) {
  const {
    node,
    scope
  } = path;
  const isMethod = path.isClassMethod();

  if (path.isPrivate()) {
    throw path.buildCodeFrameError(`Private ${isMethod ? "methods" : "fields"} in decorated classes are not supported yet.`);
  }

  new (_babelHelperReplaceSupers().default)({
    methodPath: path,
    methodNode: node,
    objectRef: classRef,
    isStatic: node.static,
    superRef,
    scope,
    file: this
  }, true).replace();
  const properties = [prop("kind", _babelCore().types.stringLiteral(isMethod ? node.kind : "field")), prop("decorators", takeDecorators(node)), prop("static", node.static && _babelCore().types.booleanLiteral(true)), prop("key", getKey(node)), isMethod ? value(node.body, node.params, node.async, node.generator) : node.value ? value(_babelCore().template.ast`{ return ${node.value} }`) : prop("value", scope.buildUndefinedNode())].filter(Boolean);
  path.remove();
  return _babelCore().types.objectExpression(properties);
}

function addDecorateHelper(file) {
  try {
    return file.addHelper("decorate");
  } catch (err) {
    if (err.code === "BABEL_HELPER_UNKNOWN") {
      err.message += "\n  '@gerhobbelt/babel-plugin-transform-decorators' in non-legacy mode" + " requires '@gerhobbelt/babel-core' version ^7.0.2 and you appear to be using" + " an older version.";
    }

    throw err;
  }
}

function buildDecoratedClass(ref, path, elements, file) {
  const {
    node,
    scope
  } = path;
  const initializeId = scope.generateUidIdentifier("initialize");
  const isDeclaration = node.id && path.isDeclaration();
  const isStrict = path.isInStrictMode();
  const {
    superClass
  } = node;
  node.type = "ClassDeclaration";
  if (!node.id) node.id = _babelCore().types.cloneNode(ref);
  let superId;

  if (superClass) {
    superId = scope.generateUidIdentifierBasedOnNode(node.superClass, "super");
    node.superClass = superId;
  }

  const classDecorators = takeDecorators(node);

  const definitions = _babelCore().types.arrayExpression(elements.map(extractElementDescriptor.bind(file, node.id, superId)));

  let replacement = _babelCore().template.expression.ast`
    ${addDecorateHelper(file)}(
      ${classDecorators || _babelCore().types.nullLiteral()},
      function (${initializeId}, ${superClass ? superId : null}) {
        ${node}
        return { F: ${_babelCore().types.cloneNode(node.id)}, d: ${definitions} };
      },
      ${superClass}
    )
  `;
  let classPathDesc = "arguments.1.body.body.0";

  if (!isStrict) {
    replacement.arguments[1].body.directives.push(_babelCore().types.directive(_babelCore().types.directiveLiteral("use strict")));
  }

  if (isDeclaration) {
    replacement = _babelCore().template.ast`let ${ref} = ${replacement}`;
    classPathDesc = "declarations.0.init." + classPathDesc;
  }

  return {
    instanceNodes: [_babelCore().template.statement.ast`${initializeId}(this)`],

    wrapClass(path) {
      path.replaceWith(replacement);
      return path.get(classPathDesc);
    }

  };
}