"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transformClass;

function _babelHelperFunctionName() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-function-name"));

  _babelHelperFunctionName = function () {
    return data;
  };

  return data;
}

function _babelHelperReplaceSupers() {
  const data = _interopRequireWildcard(require("@gerhobbelt/babel-helper-replace-supers"));

  _babelHelperReplaceSupers = function () {
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

function defineMap() {
  const data = _interopRequireWildcard(require("@gerhobbelt/babel-helper-define-map"));

  defineMap = function () {
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildConstructor(classRef, constructorBody, node) {
  const func = _babelCore().types.functionDeclaration(_babelCore().types.cloneNode(classRef), [], constructorBody);

  _babelCore().types.inherits(func, node);

  return func;
}

const verifyConstructorVisitor = _babelCore().traverse.visitors.merge([_babelHelperReplaceSupers().environmentVisitor, {
  Super(path, state) {
    if (state.isDerived) return;
    const {
      node,
      parentPath
    } = path;

    if (parentPath.isCallExpression({
      callee: node
    })) {
      throw path.buildCodeFrameError("super() is only allowed in a derived constructor");
    }
  },

  ThisExpression(path, state) {
    if (!state.isDerived) return;
    const {
      node,
      parentPath
    } = path;

    if (parentPath.isMemberExpression({
      object: node
    })) {
      return;
    }

    const assertion = _babelCore().types.callExpression(state.file.addHelper("assertThisInitialized"), [node]);

    path.replaceWith(assertion);
    path.skip();
  }

}]);

function transformClass(path, file, builtinClasses, isLoose) {
  const classState = {
    parent: undefined,
    scope: undefined,
    node: undefined,
    path: undefined,
    file: undefined,
    classId: undefined,
    classRef: undefined,
    superName: undefined,
    superReturns: [],
    isDerived: false,
    extendsNative: false,
    construct: undefined,
    constructorBody: undefined,
    userConstructor: undefined,
    userConstructorPath: undefined,
    hasConstructor: false,
    instancePropBody: [],
    instancePropRefs: {},
    staticPropBody: [],
    body: [],
    bareSupers: new Set(),
    superThises: [],
    pushedConstructor: false,
    pushedInherits: false,
    protoAlias: null,
    isLoose: false,
    hasInstanceDescriptors: false,
    hasStaticDescriptors: false,
    instanceMutatorMap: {},
    staticMutatorMap: {}
  };

  const setState = newState => {
    Object.assign(classState, newState);
  };

  const findThisesVisitor = _babelCore().traverse.visitors.merge([_babelHelperReplaceSupers().environmentVisitor, {
    ThisExpression(path) {
      classState.superThises.push(path);
    }

  }]);

  function pushToMap(node, enumerable, kind = "value", scope) {
    let mutatorMap;

    if (node.static) {
      setState({
        hasStaticDescriptors: true
      });
      mutatorMap = classState.staticMutatorMap;
    } else {
      setState({
        hasInstanceDescriptors: true
      });
      mutatorMap = classState.instanceMutatorMap;
    }

    const map = defineMap().push(mutatorMap, node, kind, classState.file, scope);

    if (enumerable) {
      map.enumerable = _babelCore().types.booleanLiteral(true);
    }

    return map;
  }

  function maybeCreateConstructor() {
    let hasConstructor = false;
    const paths = classState.path.get("body.body");

    for (const path of paths) {
      hasConstructor = path.equals("kind", "constructor");
      if (hasConstructor) break;
    }

    if (hasConstructor) return;
    let params, body;

    if (classState.isDerived) {
      const constructor = _babelCore().template.expression.ast`
        (function () {
          super(...arguments);
        })
      `;
      params = constructor.params;
      body = constructor.body;
    } else {
      params = [];
      body = _babelCore().types.blockStatement([]);
    }

    classState.path.get("body").unshiftContainer("body", _babelCore().types.classMethod("constructor", _babelCore().types.identifier("constructor"), params, body));
  }

  function buildBody() {
    maybeCreateConstructor();
    pushBody();
    verifyConstructor();

    if (classState.userConstructor) {
      const {
        constructorBody,
        userConstructor,
        construct
      } = classState;
      constructorBody.body = constructorBody.body.concat(userConstructor.body.body);

      _babelCore().types.inherits(construct, userConstructor);

      _babelCore().types.inherits(constructorBody, userConstructor.body);
    }

    pushDescriptors();
  }

  function pushBody() {
    const classBodyPaths = classState.path.get("body.body");

    for (const path of classBodyPaths) {
      const node = path.node;

      // if (path.isClassProperty()) {
      //   throw path.buildCodeFrameError("Missing class properties transform.");
      // }

      if (node.decorators) {
        throw path.buildCodeFrameError("Method has decorators, put the decorator plugin before the classes one.");
      }

      if (_babelCore().types.isClassMethod(node)) {
        const isConstructor = node.kind === "constructor";

        if (isConstructor) {
          path.traverse(verifyConstructorVisitor, {
            isDerived: classState.isDerived,
            file: classState.file
          });
        }

        const replaceSupers = new (_babelHelperReplaceSupers().default)({
          methodPath: path,
          objectRef: classState.classRef,
          superRef: classState.superName,
          isLoose: classState.isLoose,
          file: classState.file
        });
        replaceSupers.replace();
        const state = {
          returns: [],
          bareSupers: new Set()
        };
        path.traverse(_babelCore().traverse.visitors.merge([_babelHelperReplaceSupers().environmentVisitor, {
          ReturnStatement(path, state) {
            if (!path.getFunctionParent().isArrowFunctionExpression()) {
              state.returns.push(path);
            }
          },

          Super(path, state) {
            const {
              node,
              parentPath
            } = path;

            if (parentPath.isCallExpression({
              callee: node
            })) {
              state.bareSupers.add(parentPath);
            }
          }

        }]), state);

        if (isConstructor) {
          pushConstructor(state, node, path);
        } else {
          pushMethod(node, path);
        }
      }
    }
  }

  function clearDescriptors() {
    setState({
      hasInstanceDescriptors: false,
      hasStaticDescriptors: false,
      instanceMutatorMap: {},
      staticMutatorMap: {}
    });
  }

  function pushDescriptors() {
    pushInheritsToBody();
    const {
      body
    } = classState;
    let instanceProps;
    let staticProps;

    if (classState.hasInstanceDescriptors) {
      instanceProps = defineMap().toClassObject(classState.instanceMutatorMap);
    }

    if (classState.hasStaticDescriptors) {
      staticProps = defineMap().toClassObject(classState.staticMutatorMap);
    }

    if (instanceProps || staticProps) {
      if (instanceProps) {
        instanceProps = defineMap().toComputedObjectFromClass(instanceProps);
      }

      if (staticProps) {
        staticProps = defineMap().toComputedObjectFromClass(staticProps);
      }

      let args = [_babelCore().types.cloneNode(classState.classRef), _babelCore().types.nullLiteral(), _babelCore().types.nullLiteral()];
      if (instanceProps) args[1] = instanceProps;
      if (staticProps) args[2] = staticProps;
      let lastNonNullIndex = 0;

      for (let i = 0; i < args.length; i++) {
        if (!_babelCore().types.isNullLiteral(args[i])) lastNonNullIndex = i;
      }

      args = args.slice(0, lastNonNullIndex + 1);
      body.push(_babelCore().types.expressionStatement(_babelCore().types.callExpression(classState.file.addHelper("createClass"), args)));
    }

    clearDescriptors();
  }

  function wrapSuperCall(bareSuper, superRef, thisRef, body) {
    let bareSuperNode = bareSuper.node;
    let call;

    if (classState.isLoose) {
      bareSuperNode.arguments.unshift(_babelCore().types.thisExpression());

      if (bareSuperNode.arguments.length === 2 && _babelCore().types.isSpreadElement(bareSuperNode.arguments[1]) && _babelCore().types.isIdentifier(bareSuperNode.arguments[1].argument, {
        name: "arguments"
      })) {
        bareSuperNode.arguments[1] = bareSuperNode.arguments[1].argument;
        bareSuperNode.callee = _babelCore().types.memberExpression(_babelCore().types.cloneNode(superRef), _babelCore().types.identifier("apply"));
      } else {
        bareSuperNode.callee = _babelCore().types.memberExpression(_babelCore().types.cloneNode(superRef), _babelCore().types.identifier("call"));
      }

      call = _babelCore().types.logicalExpression("||", bareSuperNode, _babelCore().types.thisExpression());
    } else {
      bareSuperNode = (0, _babelHelperOptimiseCallExpression().default)(_babelCore().types.callExpression(classState.file.addHelper("getPrototypeOf"), [_babelCore().types.cloneNode(classState.classRef)]), _babelCore().types.thisExpression(), bareSuperNode.arguments);
      call = _babelCore().types.callExpression(classState.file.addHelper("possibleConstructorReturn"), [_babelCore().types.thisExpression(), bareSuperNode]);
    }

    if (bareSuper.parentPath.isExpressionStatement() && bareSuper.parentPath.container === body.node.body && body.node.body.length - 1 === bareSuper.parentPath.key) {
      if (classState.superThises.length) {
        call = _babelCore().types.assignmentExpression("=", thisRef(), call);
      }

      bareSuper.parentPath.replaceWith(_babelCore().types.returnStatement(call));
    } else {
      bareSuper.replaceWith(_babelCore().types.assignmentExpression("=", thisRef(), call));
    }
  }

  function verifyConstructor() {
    if (!classState.isDerived) return;
    const path = classState.userConstructorPath;
    const body = path.get("body");
    path.traverse(findThisesVisitor);
    let guaranteedSuperBeforeFinish = !!classState.bareSupers.size;

    let thisRef = function () {
      const ref = path.scope.generateDeclaredUidIdentifier("this");

      thisRef = () => _babelCore().types.cloneNode(ref);

      return ref;
    };

    for (const bareSuper of classState.bareSupers) {
      wrapSuperCall(bareSuper, classState.superName, thisRef, body);

      if (guaranteedSuperBeforeFinish) {
        bareSuper.find(function (parentPath) {
          if (parentPath === path) {
            return true;
          }

          if (parentPath.isLoop() || parentPath.isConditional() || parentPath.isArrowFunctionExpression()) {
            guaranteedSuperBeforeFinish = false;
            return true;
          }
        });
      }
    }

    for (const thisPath of classState.superThises) {
      const {
        node,
        parentPath
      } = thisPath;

      if (parentPath.isMemberExpression({
        object: node
      })) {
        thisPath.replaceWith(thisRef());
        continue;
      }

      thisPath.replaceWith(_babelCore().types.callExpression(classState.file.addHelper("assertThisInitialized"), [thisRef()]));
    }

    let wrapReturn;

    if (classState.isLoose) {
      wrapReturn = returnArg => {
        const thisExpr = _babelCore().types.callExpression(classState.file.addHelper("assertThisInitialized"), [thisRef()]);

        return returnArg ? _babelCore().types.logicalExpression("||", returnArg, thisExpr) : thisExpr;
      };
    } else {
      wrapReturn = returnArg => _babelCore().types.callExpression(classState.file.addHelper("possibleConstructorReturn"), [thisRef()].concat(returnArg || []));
    }

    const bodyPaths = body.get("body");

    if (!bodyPaths.length || !bodyPaths.pop().isReturnStatement()) {
      body.pushContainer("body", _babelCore().types.returnStatement(guaranteedSuperBeforeFinish ? thisRef() : wrapReturn()));
    }

    for (const returnPath of classState.superReturns) {
      returnPath.get("argument").replaceWith(wrapReturn(returnPath.node.argument));
    }
  }

  function pushMethod(node, path) {
    const scope = path ? path.scope : classState.scope;

    if (node.kind === "method") {
      if (processMethod(node, scope)) return;
    }

    pushToMap(node, false, null, scope);
  }

  function processMethod(node, scope) {
    if (classState.isLoose && !node.decorators) {
      let {
        classRef
      } = classState;

      if (!node.static) {
        insertProtoAliasOnce();
        classRef = classState.protoAlias;
      }

      const methodName = _babelCore().types.memberExpression(_babelCore().types.cloneNode(classRef), node.key, node.computed || _babelCore().types.isLiteral(node.key));

      let func = _babelCore().types.functionExpression(null, node.params, node.body, node.generator, node.async);

      _babelCore().types.inherits(func, node);

      const key = _babelCore().types.toComputedKey(node, node.key);

      if (_babelCore().types.isStringLiteral(key)) {
        func = (0, _babelHelperFunctionName().default)({
          node: func,
          id: key,
          scope
        });
      }

      const expr = _babelCore().types.expressionStatement(_babelCore().types.assignmentExpression("=", methodName, func));

      _babelCore().types.inheritsComments(expr, node);

      classState.body.push(expr);
      return true;
    }

    return false;
  }

  function insertProtoAliasOnce() {
    if (classState.protoAlias === null) {
      setState({
        protoAlias: classState.scope.generateUidIdentifier("proto")
      });

      const classProto = _babelCore().types.memberExpression(classState.classRef, _babelCore().types.identifier("prototype"));

      const protoDeclaration = _babelCore().types.variableDeclaration("var", [_babelCore().types.variableDeclarator(classState.protoAlias, classProto)]);

      classState.body.push(protoDeclaration);
    }
  }

  function pushConstructor(replaceSupers, method, path) {
    if (path.scope.hasOwnBinding(classState.classRef.name)) {
      path.scope.rename(classState.classRef.name);
    }

    setState({
      userConstructorPath: path,
      userConstructor: method,
      hasConstructor: true,
      bareSupers: replaceSupers.bareSupers,
      superReturns: replaceSupers.returns
    });
    const {
      construct
    } = classState;

    _babelCore().types.inheritsComments(construct, method);

    construct.params = method.params;

    _babelCore().types.inherits(construct.body, method.body);

    construct.body.directives = method.body.directives;
    pushConstructorToBody();
  }

  function pushConstructorToBody() {
    if (classState.pushedConstructor) return;
    classState.pushedConstructor = true;

    if (classState.hasInstanceDescriptors || classState.hasStaticDescriptors) {
      pushDescriptors();
    }

    classState.body.push(classState.construct);
    pushInheritsToBody();
  }

  function pushInheritsToBody() {
    if (!classState.isDerived || classState.pushedInherits) return;
    setState({
      pushedInherits: true
    });
    classState.body.unshift(_babelCore().types.expressionStatement(_babelCore().types.callExpression(classState.file.addHelper(classState.isLoose ? "inheritsLoose" : "inherits"), [_babelCore().types.cloneNode(classState.classRef), _babelCore().types.cloneNode(classState.superName)])));
  }

  function setupClosureParamsArgs() {
    const {
      superName
    } = classState;
    const closureParams = [];
    const closureArgs = [];

    if (classState.isDerived) {
      const arg = classState.extendsNative ? _babelCore().types.callExpression(classState.file.addHelper("wrapNativeSuper"), [_babelCore().types.cloneNode(superName)]) : _babelCore().types.cloneNode(superName);
      const param = classState.scope.generateUidIdentifierBasedOnNode(superName);
      closureParams.push(param);
      closureArgs.push(arg);
      setState({
        superName: _babelCore().types.cloneNode(param)
      });
    }

    return {
      closureParams,
      closureArgs
    };
  }

  function classTransformer(path, file, builtinClasses, isLoose) {
    setState({
      parent: path.parent,
      scope: path.scope,
      node: path.node,
      path,
      file,
      isLoose
    });
    setState({
      classId: classState.node.id,
      classRef: classState.node.id ? _babelCore().types.identifier(classState.node.id.name) : classState.scope.generateUidIdentifier("class"),
      superName: classState.node.superClass,
      isDerived: !!classState.node.superClass,
      constructorBody: _babelCore().types.blockStatement([])
    });
    setState({
      extendsNative: classState.isDerived && builtinClasses.has(classState.superName.name) && !classState.scope.hasBinding(classState.superName.name, true)
    });
    const {
      classRef,
      node,
      constructorBody
    } = classState;
    setState({
      construct: buildConstructor(classRef, constructorBody, node)
    });
    let {
      body
    } = classState;
    const {
      closureParams,
      closureArgs
    } = setupClosureParamsArgs();
    buildBody();

    if (!classState.isLoose) {
      constructorBody.body.unshift(_babelCore().types.expressionStatement(_babelCore().types.callExpression(classState.file.addHelper("classCallCheck"), [_babelCore().types.thisExpression(), _babelCore().types.cloneNode(classState.classRef)])));
    }

    body = body.concat(classState.staticPropBody.map(fn => fn(_babelCore().types.cloneNode(classState.classRef))));
    const isStrict = path.isInStrictMode();
    let constructorOnly = classState.classId && body.length === 1;

    if (constructorOnly && !isStrict) {
      for (const param of classState.construct.params) {
        if (!_babelCore().types.isIdentifier(param)) {
          constructorOnly = false;
          break;
        }
      }
    }

    const directives = constructorOnly ? body[0].body.directives : [];

    if (!isStrict) {
      directives.push(_babelCore().types.directive(_babelCore().types.directiveLiteral("use strict")));
    }

    if (constructorOnly) {
      return _babelCore().types.toExpression(body[0]);
    }

    body.push(_babelCore().types.returnStatement(_babelCore().types.cloneNode(classState.classRef)));

    const container = _babelCore().types.arrowFunctionExpression(closureParams, _babelCore().types.blockStatement(body, directives));

    return _babelCore().types.callExpression(container, closureArgs);
  }

  return classTransformer(path, file, builtinClasses, isLoose);
}