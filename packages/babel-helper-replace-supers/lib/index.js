"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.environmentVisitor = void 0;

function _babelTraverse() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-traverse"));

  _babelTraverse = function () {
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

function t() {
  const data = _interopRequireWildcard(require("@gerhobbelt/babel-types"));

  t = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getPrototypeOfExpression(objectRef, isStatic, file) {
  objectRef = t().cloneNode(objectRef);
  const targetRef = isStatic ? objectRef : t().memberExpression(objectRef, t().identifier("prototype"));
  return t().callExpression(file.addHelper("getPrototypeOf"), [targetRef]);
}

function skipAllButComputedKey(path) {
  if (!path.node.computed) {
    path.skip();
    return;
  }

  const keys = t().VISITOR_KEYS[path.type];

  for (const key of keys) {
    if (key !== "key") path.skipKey(key);
  }
}

const environmentVisitor = {
  TypeAnnotation(path) {
    path.skip();
  },

  Function(path) {
    if (path.isMethod()) return;
    if (path.isArrowFunctionExpression()) return;
    path.skip();
  },

  Method(path) {
    skipAllButComputedKey(path);
  },

  "ClassProperty|ClassPrivateProperty"(path) {
    if (path.node.static) return;
    skipAllButComputedKey(path);
  }

};
exports.environmentVisitor = environmentVisitor;

const visitor = _babelTraverse().default.visitors.merge([environmentVisitor, {
  Super(path, state) {
    const {
      node,
      parentPath
    } = path;
    if (!parentPath.isMemberExpression({
      object: node
    })) return;
    state.handle(parentPath);
  }

}]);

const specHandlers = {
  memoise(superMember, count) {
    const {
      scope,
      node
    } = superMember;
    const {
      computed,
      property
    } = node;

    if (!computed) {
      return;
    }

    const memo = scope.maybeGenerateMemoised(property);

    if (!memo) {
      return;
    }

    this.memoiser.set(property, memo, count);
  },

  prop(superMember) {
    const {
      computed,
      property
    } = superMember.node;

    if (this.memoiser.has(property)) {
      return t().cloneNode(this.memoiser.get(property));
    }

    if (computed) {
      return t().cloneNode(property);
    }

    return t().stringLiteral(property.name);
  },

  get(superMember) {
    return t().callExpression(this.file.addHelper("get"), [getPrototypeOfExpression(this.getObjectRef(), this.isStatic, this.file), this.prop(superMember), t().thisExpression()]);
  },

  set(superMember, value) {
    return t().callExpression(this.file.addHelper("set"), [getPrototypeOfExpression(this.getObjectRef(), this.isStatic, this.file), this.prop(superMember), value, t().thisExpression(), t().booleanLiteral(superMember.isInStrictMode())]);
  },

  call(superMember, args) {
    return (0, _babelHelperOptimiseCallExpression().default)(this.get(superMember), t().thisExpression(), args);
  }

};
const looseHandlers = Object.assign({}, specHandlers, {
  prop(superMember) {
    const {
      property
    } = superMember.node;

    if (this.memoiser.has(property)) {
      return t().cloneNode(this.memoiser.get(property));
    }

    return t().cloneNode(property);
  },

  get(superMember) {
    const {
      isStatic,
      superRef
    } = this;
    const {
      computed
    } = superMember.node;
    const prop = this.prop(superMember);
    let object;

    if (isStatic) {
      object = superRef ? t().cloneNode(superRef) : t().memberExpression(t().identifier("Function"), t().identifier("prototype"));
    } else {
      object = superRef ? t().memberExpression(t().cloneNode(superRef), t().identifier("prototype")) : t().memberExpression(t().identifier("Object"), t().identifier("prototype"));
    }

    return t().memberExpression(object, prop, computed);
  },

  set(superMember, value) {
    const {
      computed
    } = superMember.node;
    const prop = this.prop(superMember);
    return t().assignmentExpression("=", t().memberExpression(t().thisExpression(), prop, computed), value);
  }

});

class ReplaceSupers {
  constructor(opts) {
    const path = opts.methodPath;
    this.methodPath = path;
    this.isStatic = path.isClassMethod({
      static: true
    }) || path.isObjectMethod();
    this.file = opts.file;
    this.superRef = opts.superRef;
    this.isLoose = opts.isLoose;
    this.opts = opts;
  }

  getObjectRef() {
    return t().cloneNode(this.opts.objectRef || this.opts.getObjectRef());
  }

  replace() {
    const handler = this.isLoose ? looseHandlers : specHandlers;
    (0, _babelHelperMemberExpressionToFunctions().default)(this.methodPath, visitor, Object.assign({
      file: this.file,
      isStatic: this.isStatic,
      getObjectRef: this.getObjectRef.bind(this),
      superRef: this.superRef
    }, handler));
  }

}

exports.default = ReplaceSupers;