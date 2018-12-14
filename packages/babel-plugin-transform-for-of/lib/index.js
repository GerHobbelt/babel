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

function _babelCore() {
  const data = require("@gerhobbelt/babel-core");

  _babelCore = function () {
    return data;
  };

  return data;
}

var _default = (0, _babelHelperPluginUtils().declare)((api, options) => {
  api.assertVersion(7);
  const {
    loose,
    assumeArray
  } = options;

  if (loose === true && assumeArray === true) {
    throw new Error(`The loose and assumeArray options cannot be used together in @gerhobbelt/babel-plugin-transform-for-of`);
  }

  if (assumeArray) {
    return {
      name: "transform-for-of",
      visitor: {
        ForOfStatement(path) {
          const {
            scope
          } = path;
          const {
            left,
            right,
            body
          } = path.node;
          const i = scope.generateUidIdentifier("i");
          let array = scope.maybeGenerateMemoised(right, true);
          const inits = [_babelCore().types.variableDeclarator(i, _babelCore().types.numericLiteral(0))];

          if (array) {
            inits.push(_babelCore().types.variableDeclarator(array, right));
          } else {
            array = right;
          }

          const item = _babelCore().types.memberExpression(_babelCore().types.cloneNode(array), _babelCore().types.cloneNode(i), true);

          let assignment;

          if (_babelCore().types.isVariableDeclaration(left)) {
            assignment = left;
            assignment.declarations[0].init = item;
          } else {
            assignment = _babelCore().types.expressionStatement(_babelCore().types.assignmentExpression("=", left, item));
          }

          const block = _babelCore().types.toBlock(body);

          block.body.unshift(assignment);
          path.replaceWith(_babelCore().types.forStatement(_babelCore().types.variableDeclaration("let", inits), _babelCore().types.binaryExpression("<", _babelCore().types.cloneNode(i), _babelCore().types.memberExpression(_babelCore().types.cloneNode(array), _babelCore().types.identifier("length"))), _babelCore().types.updateExpression("++", _babelCore().types.cloneNode(i)), block));
        }

      }
    };
  }

  const pushComputedProps = loose ? pushComputedPropsLoose : pushComputedPropsSpec;
  const buildForOfArray = (0, _babelCore().template)(`
    for (var KEY = 0; KEY < ARR.length; KEY++) BODY;
  `);
  const buildForOfLoose = (0, _babelCore().template)(`
    for (var LOOP_OBJECT = OBJECT,
             IS_ARRAY = Array.isArray(LOOP_OBJECT),
             INDEX = 0,
             LOOP_OBJECT = IS_ARRAY ? LOOP_OBJECT : LOOP_OBJECT[Symbol.iterator]();;) {
      INTERMEDIATE;
      if (IS_ARRAY) {
        if (INDEX >= LOOP_OBJECT.length) break;
        ID = LOOP_OBJECT[INDEX++];
      } else {
        INDEX = LOOP_OBJECT.next();
        if (INDEX.done) break;
        ID = INDEX.value;
      }
    }
  `);
  const buildForOf = (0, _babelCore().template)(`
    var ITERATOR_COMPLETION = true;
    var ITERATOR_HAD_ERROR_KEY = false;
    var ITERATOR_ERROR_KEY = undefined;
    try {
      for (
        var ITERATOR_KEY = OBJECT[Symbol.iterator](), STEP_KEY;
        !(ITERATOR_COMPLETION = (STEP_KEY = ITERATOR_KEY.next()).done);
        ITERATOR_COMPLETION = true
      ) {}
    } catch (err) {
      ITERATOR_HAD_ERROR_KEY = true;
      ITERATOR_ERROR_KEY = err;
    } finally {
      try {
        if (!ITERATOR_COMPLETION && ITERATOR_KEY.return != null) {
          ITERATOR_KEY.return();
        }
      } finally {
        if (ITERATOR_HAD_ERROR_KEY) {
          throw ITERATOR_ERROR_KEY;
        }
      }
    }
  `);

  function _ForOfStatementArray(path) {
    const {
      node,
      scope
    } = path;
    const nodes = [];
    let right = node.right;

    if (!_babelCore().types.isIdentifier(right) || !scope.hasBinding(right.name)) {
      const uid = scope.generateUid("arr");
      nodes.push(_babelCore().types.variableDeclaration("var", [_babelCore().types.variableDeclarator(_babelCore().types.identifier(uid), right)]));
      right = _babelCore().types.identifier(uid);
    }

    const iterationKey = scope.generateUidIdentifier("i");
    let loop = buildForOfArray({
      BODY: node.body,
      KEY: iterationKey,
      ARR: right
    });

    _babelCore().types.inherits(loop, node);

    _babelCore().types.ensureBlock(loop);

    const iterationValue = _babelCore().types.memberExpression(_babelCore().types.cloneNode(right), _babelCore().types.cloneNode(iterationKey), true);

    const left = node.left;

    if (_babelCore().types.isVariableDeclaration(left)) {
      left.declarations[0].init = iterationValue;
      loop.body.body.unshift(left);
    } else {
      loop.body.body.unshift(_babelCore().types.expressionStatement(_babelCore().types.assignmentExpression("=", left, iterationValue)));
    }

    if (path.parentPath.isLabeledStatement()) {
      loop = _babelCore().types.labeledStatement(path.parentPath.node.label, loop);
    }

    nodes.push(loop);
    return nodes;
  }

  function replaceWithArray(path) {
    if (path.parentPath.isLabeledStatement()) {
      path.parentPath.replaceWithMultiple(_ForOfStatementArray(path));
    } else {
      path.replaceWithMultiple(_ForOfStatementArray(path));
    }
  }

  return {
    name: "transform-for-of",
    visitor: {
      ForOfStatement(path, state) {
        const right = path.get("right");

        if (right.isArrayExpression() || right.isGenericType("Array") || _babelCore().types.isArrayTypeAnnotation(right.getTypeAnnotation())) {
          replaceWithArray(path);
          return;
        }

        const {
          node
        } = path;
        const build = pushComputedProps(path, state);
        const declar = build.declar;
        const loop = build.loop;
        const block = loop.body;
        path.ensureBlock();

        if (declar) {
          block.body.push(declar);
        }

        block.body = block.body.concat(node.body.body);

        _babelCore().types.inherits(loop, node);

        _babelCore().types.inherits(loop.body, node.body);

        if (build.replaceParent) {
          path.parentPath.replaceWithMultiple(build.node);
          path.remove();
        } else {
          path.replaceWithMultiple(build.node);
        }
      }

    }
  };

  function pushComputedPropsLoose(path, file) {
    const {
      node,
      scope,
      parent
    } = path;
    const {
      left
    } = node;
    let declar, id, intermediate;

    if (_babelCore().types.isIdentifier(left) || _babelCore().types.isPattern(left) || _babelCore().types.isMemberExpression(left)) {
      id = left;
      intermediate = null;
    } else if (_babelCore().types.isVariableDeclaration(left)) {
      id = scope.generateUidIdentifier("ref");
      declar = _babelCore().types.variableDeclaration(left.kind, [_babelCore().types.variableDeclarator(left.declarations[0].id, _babelCore().types.identifier(id.name))]);
      intermediate = _babelCore().types.variableDeclaration("var", [_babelCore().types.variableDeclarator(_babelCore().types.identifier(id.name))]);
    } else {
      throw file.buildCodeFrameError(left, `Unknown node type ${left.type} in ForStatement`);
    }

    const iteratorKey = scope.generateUidIdentifier("iterator");
    const isArrayKey = scope.generateUidIdentifier("isArray");
    const loop = buildForOfLoose({
      LOOP_OBJECT: iteratorKey,
      IS_ARRAY: isArrayKey,
      OBJECT: node.right,
      INDEX: scope.generateUidIdentifier("i"),
      ID: id,
      INTERMEDIATE: intermediate
    });

    const isLabeledParent = _babelCore().types.isLabeledStatement(parent);

    let labeled;

    if (isLabeledParent) {
      labeled = _babelCore().types.labeledStatement(parent.label, loop);
    }

    return {
      replaceParent: isLabeledParent,
      declar: declar,
      node: labeled || loop,
      loop: loop
    };
  }

  function pushComputedPropsSpec(path, file) {
    const {
      node,
      scope,
      parent
    } = path;
    const left = node.left;
    let declar;
    const stepKey = scope.generateUid("step");

    const stepValue = _babelCore().types.memberExpression(_babelCore().types.identifier(stepKey), _babelCore().types.identifier("value"));

    if (_babelCore().types.isIdentifier(left) || _babelCore().types.isPattern(left) || _babelCore().types.isMemberExpression(left)) {
      declar = _babelCore().types.expressionStatement(_babelCore().types.assignmentExpression("=", left, stepValue));
    } else if (_babelCore().types.isVariableDeclaration(left)) {
      declar = _babelCore().types.variableDeclaration(left.kind, [_babelCore().types.variableDeclarator(left.declarations[0].id, stepValue)]);
    } else {
      throw file.buildCodeFrameError(left, `Unknown node type ${left.type} in ForStatement`);
    }

    const template = buildForOf({
      ITERATOR_HAD_ERROR_KEY: scope.generateUidIdentifier("didIteratorError"),
      ITERATOR_COMPLETION: scope.generateUidIdentifier("iteratorNormalCompletion"),
      ITERATOR_ERROR_KEY: scope.generateUidIdentifier("iteratorError"),
      ITERATOR_KEY: scope.generateUidIdentifier("iterator"),
      STEP_KEY: _babelCore().types.identifier(stepKey),
      OBJECT: node.right
    });

    const isLabeledParent = _babelCore().types.isLabeledStatement(parent);

    const tryBody = template[3].block.body;
    const loop = tryBody[0];

    if (isLabeledParent) {
      tryBody[0] = _babelCore().types.labeledStatement(parent.label, loop);
    }

    return {
      replaceParent: isLabeledParent,
      declar: declar,
      loop: loop,
      node: template
    };
  }
});

exports.default = _default;