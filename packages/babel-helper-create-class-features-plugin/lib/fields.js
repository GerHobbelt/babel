"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildPrivateNamesMap = buildPrivateNamesMap;
exports.buildPrivateNamesNodes = buildPrivateNamesNodes;
exports.transformPrivateNamesUsage = transformPrivateNamesUsage;
exports.buildFieldsInitNodes = buildFieldsInitNodes;

function _babelCore() {
  const data = require("@gerhobbelt/babel-core");

  _babelCore = function () {
    return data;
  };

  return data;
}

function _babelHelperReplaceSupers() {
  const data = require("@gerhobbelt/babel-helper-replace-supers");

  _babelHelperReplaceSupers = function () {
    return data;
  };

  return data;
}

function _babelHelperMemberExpressionToFunctions() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-member-expression-to-functions"));

  _babelHelperMemberExpressionToFunctions = function () {
    return data;
  };

  return data;
}

function _babelHelperOptimiseCallExpression() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-optimise-call-expression"));

  _babelHelperOptimiseCallExpression = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildPrivateNamesMap(props) {
  const privateNamesMap = new Map();

  for (const prop of props) {
    if (prop.isPrivate()) {
      const {
        name
      } = prop.node.key.id;
      privateNamesMap.set(name, {
        id: prop.scope.generateUidIdentifier(name),
        static: !!prop.node.static,
        method: prop.isMethod(),
        methodId: prop.isMethod() ? prop.scope.generateUidIdentifier(name) : undefined
      });
    }
  }

  return privateNamesMap;
}

function buildPrivateNamesNodes(privateNamesMap, loose, state) {
  const initNodes = [];

  for (const [name, value] of privateNamesMap) {
    const {
      id,
      static: isStatic,
      method: isMethod
    } = value;

    if (loose) {
      initNodes.push(_babelCore().template.statement.ast`
          var ${id} = ${state.addHelper("classPrivateFieldLooseKey")}("${name}")
        `);
    } else if (isMethod && !isStatic) {
      initNodes.push(_babelCore().template.statement.ast`var ${id} = new WeakSet();`);
    } else if (!isStatic) {
      initNodes.push(_babelCore().template.statement.ast`var ${id} = new WeakMap();`);
    }
  }

  return initNodes;
}

const privateNameVisitor = {
  PrivateName(path) {
    const {
      privateNamesMap
    } = this;
    const {
      node,
      parentPath
    } = path;
    if (!parentPath.isMemberExpression({
      property: node
    })) return;
    if (!privateNamesMap.has(node.id.name)) return;
    this.handle(parentPath);
  },

  Class(path) {
    const {
      privateNamesMap
    } = this;
    const body = path.get("body.body");

    for (const prop of body) {
      if (!prop.isPrivate()) {
        continue;
      }

      if (!privateNamesMap.has(prop.node.key.id.name)) continue;
      path.traverse(privateNameInnerVisitor, this);
      path.skip();
      break;
    }
  }

};

const privateNameInnerVisitor = _babelCore().traverse.visitors.merge([{
  PrivateName: privateNameVisitor.PrivateName
}, _babelHelperReplaceSupers().environmentVisitor]);

const privateNameHandlerSpec = {
  memoise(member, count) {
    const {
      scope
    } = member;
    const {
      object
    } = member.node;
    const memo = scope.maybeGenerateMemoised(object);

    if (!memo) {
      return;
    }

    this.memoiser.set(object, memo, count);
  },

  receiver(member) {
    const {
      object
    } = member.node;

    if (this.memoiser.has(object)) {
      return _babelCore().types.cloneNode(this.memoiser.get(object));
    }

    return _babelCore().types.cloneNode(object);
  },

  get(member) {
    const {
      classRef,
      privateNamesMap,
      file
    } = this;
    const {
      name
    } = member.node.property.id;
    const {
      id,
      static: isStatic,
      method: isMethod,
      methodId
    } = privateNamesMap.get(name);

    if (isStatic && !isMethod) {
      return _babelCore().types.callExpression(file.addHelper("classStaticPrivateFieldSpecGet"), [this.receiver(member), _babelCore().types.cloneNode(classRef), _babelCore().types.cloneNode(id)]);
    } else if (isMethod) {
      return _babelCore().types.callExpression(file.addHelper("classPrivateMethodGet"), [this.receiver(member), _babelCore().types.cloneNode(id), _babelCore().types.cloneNode(methodId)]);
    } else {
      return _babelCore().types.callExpression(file.addHelper("classPrivateFieldGet"), [this.receiver(member), _babelCore().types.cloneNode(id)]);
    }
  },

  set(member, value) {
    const {
      classRef,
      privateNamesMap,
      file
    } = this;
    const {
      name
    } = member.node.property.id;
    const {
      id,
      static: isStatic,
      method: isMethod
    } = privateNamesMap.get(name);

    if (isStatic && !isMethod) {
      return _babelCore().types.callExpression(file.addHelper("classStaticPrivateFieldSpecSet"), [this.receiver(member), _babelCore().types.cloneNode(classRef), _babelCore().types.cloneNode(id), value]);
    } else if (isMethod) {
      return _babelCore().types.callExpression(file.addHelper("classPrivateMethodSet"), []);
    } else {
      return _babelCore().types.callExpression(file.addHelper("classPrivateFieldSet"), [this.receiver(member), _babelCore().types.cloneNode(id), value]);
    }
  },

  call(member, args) {
    this.memoise(member, 1);
    return (0, _babelHelperOptimiseCallExpression().default)(this.get(member), this.receiver(member), args);
  }

};
const privateNameHandlerLoose = {
  handle(member) {
    const {
      privateNamesMap,
      file
    } = this;
    const {
      object
    } = member.node;
    const {
      name
    } = member.node.property.id;
    member.replaceWith(_babelCore().template.expression`BASE(REF, PROP)[PROP]`({
      BASE: file.addHelper("classPrivateFieldLooseBase"),
      REF: object,
      PROP: privateNamesMap.get(name).id
    }));
  }

};

function transformPrivateNamesUsage(ref, path, privateNamesMap, loose, state) {
  const body = path.get("body");

  if (loose) {
    body.traverse(privateNameVisitor, Object.assign({
      privateNamesMap,
      file: state
    }, privateNameHandlerLoose));
  } else {
    (0, _babelHelperMemberExpressionToFunctions().default)(body, privateNameVisitor, Object.assign({
      privateNamesMap,
      classRef: ref,
      file: state
    }, privateNameHandlerSpec));
  }
}

function buildPrivateFieldInitLoose(ref, prop, privateNamesMap) {
  const {
    id
  } = privateNamesMap.get(prop.node.key.id.name);
  const value = prop.node.value || prop.scope.buildUndefinedNode();
  return _babelCore().template.statement.ast`
    Object.defineProperty(${ref}, ${id}, {
      // configurable is false by default
      // enumerable is false by default
      writable: true,
      value: ${value}
    });
  `;
}

function buildPrivateInstanceFieldInitSpec(ref, prop, privateNamesMap) {
  const {
    id
  } = privateNamesMap.get(prop.node.key.id.name);
  const value = prop.node.value || prop.scope.buildUndefinedNode();
  return _babelCore().template.statement.ast`${id}.set(${ref}, {
    // configurable is always false for private elements
    // enumerable is always false for private elements
    writable: true,
    value: ${value},
  })`;
}

function buildPrivateStaticFieldInitSpec(prop, privateNamesMap) {
  const {
    id
  } = privateNamesMap.get(prop.node.key.id.name);
  const value = prop.node.value || prop.scope.buildUndefinedNode();
  return _babelCore().template.statement.ast`
    var ${id} = {
      // configurable is false by default
      // enumerable is false by default
      writable: true,
      value: ${value}
    };
  `;
}

function buildPrivateMethodInitLoose(ref, prop, privateNamesMap) {
  const {
    methodId,
    id
  } = privateNamesMap.get(prop.node.key.id.name);
  return _babelCore().template.statement.ast`
    Object.defineProperty(${ref}, ${id}, {
      // configurable is false by default
      // enumerable is false by default
      // writable is false by default
      value: ${methodId.name}
    });
  `;
}

function buildPrivateInstanceMethodInitSpec(ref, prop, privateNamesMap) {
  const {
    id
  } = privateNamesMap.get(prop.node.key.id.name);
  return _babelCore().template.statement.ast`${id}.add(${ref})`;
}

function buildPublicFieldInitLoose(ref, prop) {
  const {
    key,
    computed
  } = prop.node;
  const value = prop.node.value || prop.scope.buildUndefinedNode();
  return _babelCore().types.expressionStatement(_babelCore().types.assignmentExpression("=", _babelCore().types.memberExpression(ref, key, computed || _babelCore().types.isLiteral(key)), value));
}

function buildPublicFieldInitSpec(ref, prop, state) {
  const {
    key,
    computed
  } = prop.node;
  const value = prop.node.value || prop.scope.buildUndefinedNode();
  return _babelCore().types.expressionStatement(_babelCore().types.callExpression(state.addHelper("defineProperty"), [ref, computed || _babelCore().types.isLiteral(key) ? key : _babelCore().types.stringLiteral(key.name), value]));
}

function buildPrivateInstanceMethodDeclaration(prop, privateNamesMap) {
  const {
    methodId
  } = privateNamesMap.get(prop.node.key.id.name);
  const {
    params,
    body
  } = prop.node;

  const methodValue = _babelCore().types.functionExpression(methodId, params, body);

  return _babelCore().types.variableDeclaration("var", [_babelCore().types.variableDeclarator(methodId, methodValue)]);
}

function buildFieldsInitNodes(ref, props, privateNamesMap, state, loose) {
  const staticNodes = [];
  const instanceNodes = [];
  let needsClassRef = false;

  for (const prop of props) {
    const isStatic = prop.node.static;
    const isInstance = !isStatic;
    const isPrivate = prop.isPrivate();
    const isPublic = !isPrivate;
    const isField = prop.isProperty();
    const isMethod = !isField;

    switch (true) {
      case isStatic && isPrivate && isField && loose:
        needsClassRef = true;
        staticNodes.push(buildPrivateFieldInitLoose(_babelCore().types.cloneNode(ref), prop, privateNamesMap));
        break;

      case isStatic && isPrivate && isField && !loose:
        needsClassRef = true;
        staticNodes.push(buildPrivateStaticFieldInitSpec(prop, privateNamesMap));
        break;

      case isStatic && isPublic && isField && loose:
        needsClassRef = true;
        staticNodes.push(buildPublicFieldInitLoose(_babelCore().types.cloneNode(ref), prop));
        break;

      case isStatic && isPublic && isField && !loose:
        needsClassRef = true;
        staticNodes.push(buildPublicFieldInitSpec(_babelCore().types.cloneNode(ref), prop, state));
        break;

      case isInstance && isPrivate && isField && loose:
        instanceNodes.push(buildPrivateFieldInitLoose(_babelCore().types.thisExpression(), prop, privateNamesMap));
        break;

      case isInstance && isPrivate && isField && !loose:
        instanceNodes.push(buildPrivateInstanceFieldInitSpec(_babelCore().types.thisExpression(), prop, privateNamesMap));
        break;

      case isInstance && isPrivate && isMethod && loose:
        instanceNodes.push(buildPrivateMethodInitLoose(_babelCore().types.thisExpression(), prop, privateNamesMap));
        staticNodes.push(buildPrivateInstanceMethodDeclaration(prop, privateNamesMap));
        break;

      case isInstance && isPrivate && isMethod && !loose:
        instanceNodes.push(buildPrivateInstanceMethodInitSpec(_babelCore().types.thisExpression(), prop, privateNamesMap));
        staticNodes.push(buildPrivateInstanceMethodDeclaration(prop, privateNamesMap));
        break;

      case isInstance && isPublic && isField && loose:
        instanceNodes.push(buildPublicFieldInitLoose(_babelCore().types.thisExpression(), prop));
        break;

      case isInstance && isPublic && isField && !loose:
        instanceNodes.push(buildPublicFieldInitSpec(_babelCore().types.thisExpression(), prop, state));
        break;

      default:
        throw new Error("Unreachable.");
    }
  }

  return {
    staticNodes,
    instanceNodes,

    wrapClass(path) {
      for (const prop of props) {
        prop.remove();
      }

      if (!needsClassRef) return path;

      if (path.isClassExpression()) {
        path.scope.push({
          id: ref
        });
        path.replaceWith(_babelCore().types.assignmentExpression("=", _babelCore().types.cloneNode(ref), path.node));
      } else if (!path.node.id) {
        path.node.id = ref;
      }

      return path;
    }

  };
}