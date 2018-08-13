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
    loose = false,
    useBuiltIns = false
  } = options;

  if (typeof loose !== "boolean") {
    throw new Error(`.loose must be a boolean or undefined`);
  }

  const arrayOnlySpread = loose;

  function getExtendsHelper(file) {
    return useBuiltIns ? _babelCore().types.memberExpression(_babelCore().types.identifier("Object"), _babelCore().types.identifier("assign")) : file.addHelper("extends");
  }

  function variableDeclarationHasPattern(node) {
    for (const declar of node.declarations) {
      if (_babelCore().types.isPattern(declar.id)) {
        return true;
      }
    }

    return false;
  }

  function hasRest(pattern) {
    for (const elem of pattern.elements) {
      if (_babelCore().types.isRestElement(elem)) {
        return true;
      }
    }

    return false;
  }

  const arrayUnpackVisitor = {
    ReferencedIdentifier(path, state) {
      if (state.bindings[path.node.name]) {
        state.deopt = true;
        path.stop();
      }
    }

  };

  class DestructuringTransformer {
    constructor(opts) {
      this.blockHoist = opts.blockHoist;
      this.operator = opts.operator;
      this.arrays = {};
      this.nodes = opts.nodes || [];
      this.scope = opts.scope;
      this.kind = opts.kind;
      this.arrayOnlySpread = opts.arrayOnlySpread;
      this.addHelper = opts.addHelper;
    }

    buildVariableAssignment(id, init) {
      let op = this.operator;
      if (_babelCore().types.isMemberExpression(id)) op = "=";
      let node;

      if (op) {
        node = _babelCore().types.expressionStatement(_babelCore().types.assignmentExpression(op, id, _babelCore().types.cloneNode(init)));
      } else {
        node = _babelCore().types.variableDeclaration(this.kind, [_babelCore().types.variableDeclarator(id, _babelCore().types.cloneNode(init))]);
      }

      node._blockHoist = this.blockHoist;
      return node;
    }

    buildVariableDeclaration(id, init) {
      const declar = _babelCore().types.variableDeclaration("var", [_babelCore().types.variableDeclarator(_babelCore().types.cloneNode(id), _babelCore().types.cloneNode(init))]);

      declar._blockHoist = this.blockHoist;
      return declar;
    }

    push(id, _init) {
      const init = _babelCore().types.cloneNode(_init);

      if (_babelCore().types.isObjectPattern(id)) {
        this.pushObjectPattern(id, init);
      } else if (_babelCore().types.isArrayPattern(id)) {
        this.pushArrayPattern(id, init);
      } else if (_babelCore().types.isAssignmentPattern(id)) {
        this.pushAssignmentPattern(id, init);
      } else {
        this.nodes.push(this.buildVariableAssignment(id, init));
      }
    }

    toArray(node, count) {
      if (this.arrayOnlySpread || _babelCore().types.isIdentifier(node) && this.arrays[node.name]) {
        return node;
      } else {
        return this.scope.toArray(node, count);
      }
    }

    pushAssignmentPattern({
      left,
      right
    }, valueRef) {
      const tempId = this.scope.generateUidIdentifierBasedOnNode(valueRef);
      this.nodes.push(this.buildVariableDeclaration(tempId, valueRef));

      const tempConditional = _babelCore().types.conditionalExpression(_babelCore().types.binaryExpression("===", _babelCore().types.cloneNode(tempId), this.scope.buildUndefinedNode()), right, _babelCore().types.cloneNode(tempId));

      if (_babelCore().types.isPattern(left)) {
        let patternId;
        let node;

        if (this.kind === "const") {
          patternId = this.scope.generateUidIdentifier(tempId.name);
          node = this.buildVariableDeclaration(patternId, tempConditional);
        } else {
          patternId = tempId;
          node = _babelCore().types.expressionStatement(_babelCore().types.assignmentExpression("=", _babelCore().types.cloneNode(tempId), tempConditional));
        }

        this.nodes.push(node);
        this.push(left, patternId);
      } else {
        this.nodes.push(this.buildVariableAssignment(left, tempConditional));
      }
    }

    pushObjectRest(pattern, objRef, spreadProp, spreadPropIndex) {
      let keys = [];

      for (let i = 0; i < pattern.properties.length; i++) {
        const prop = pattern.properties[i];
        if (i >= spreadPropIndex) break;
        if (_babelCore().types.isRestElement(prop)) continue;
        let key = prop.key;

        if (_babelCore().types.isIdentifier(key) && !prop.computed) {
          key = _babelCore().types.stringLiteral(prop.key.name);
        }

        keys.push(_babelCore().types.cloneNode(key));
      }

      let value;

      if (keys.length === 0) {
        value = _babelCore().types.callExpression(getExtendsHelper(this), [_babelCore().types.objectExpression([]), _babelCore().types.cloneNode(objRef)]);
      } else {
        keys = _babelCore().types.arrayExpression(keys);
        value = _babelCore().types.callExpression(this.addHelper(`objectWithoutProperties${loose ? "Loose" : ""}`), [_babelCore().types.cloneNode(objRef), keys]);
      }

      this.nodes.push(this.buildVariableAssignment(spreadProp.argument, value));
    }

    pushObjectProperty(prop, propRef) {
      if (_babelCore().types.isLiteral(prop.key)) prop.computed = true;
      const pattern = prop.value;

      const objRef = _babelCore().types.memberExpression(_babelCore().types.cloneNode(propRef), prop.key, prop.computed);

      if (_babelCore().types.isPattern(pattern)) {
        this.push(pattern, objRef);
      } else {
        this.nodes.push(this.buildVariableAssignment(pattern, objRef));
      }
    }

    pushObjectPattern(pattern, objRef) {
      if (!pattern.properties.length) {
        this.nodes.push(_babelCore().types.expressionStatement(_babelCore().types.callExpression(this.addHelper("objectDestructuringEmpty"), [objRef])));
      }

      if (pattern.properties.length > 1 && !this.scope.isStatic(objRef)) {
        const temp = this.scope.generateUidIdentifierBasedOnNode(objRef);
        this.nodes.push(this.buildVariableDeclaration(temp, objRef));
        objRef = temp;
      }

      for (let i = 0; i < pattern.properties.length; i++) {
        const prop = pattern.properties[i];

        if (_babelCore().types.isRestElement(prop)) {
          this.pushObjectRest(pattern, objRef, prop, i);
        } else {
          this.pushObjectProperty(prop, objRef);
        }
      }
    }

    canUnpackArrayPattern(pattern, arr) {
      if (!_babelCore().types.isArrayExpression(arr)) return false;
      if (pattern.elements.length > arr.elements.length) return;

      if (pattern.elements.length < arr.elements.length && !hasRest(pattern)) {
        return false;
      }

      for (const elem of pattern.elements) {
        if (!elem) return false;
        if (_babelCore().types.isMemberExpression(elem)) return false;
      }

      for (const elem of arr.elements) {
        if (_babelCore().types.isSpreadElement(elem)) return false;
        if (_babelCore().types.isCallExpression(elem)) return false;
        if (_babelCore().types.isMemberExpression(elem)) return false;
      }

      const bindings = _babelCore().types.getBindingIdentifiers(pattern);

      const state = {
        deopt: false,
        bindings
      };
      this.scope.traverse(arr, arrayUnpackVisitor, state);
      return !state.deopt;
    }

    pushUnpackedArrayPattern(pattern, arr) {
      for (let i = 0; i < pattern.elements.length; i++) {
        const elem = pattern.elements[i];

        if (_babelCore().types.isRestElement(elem)) {
          this.push(elem.argument, _babelCore().types.arrayExpression(arr.elements.slice(i)));
        } else {
          this.push(elem, arr.elements[i]);
        }
      }
    }

    pushArrayPattern(pattern, arrayRef) {
      if (!pattern.elements) return;

      if (this.canUnpackArrayPattern(pattern, arrayRef)) {
        return this.pushUnpackedArrayPattern(pattern, arrayRef);
      }

      const count = !hasRest(pattern) && pattern.elements.length;
      const toArray = this.toArray(arrayRef, count);

      if (_babelCore().types.isIdentifier(toArray)) {
        arrayRef = toArray;
      } else {
        arrayRef = this.scope.generateUidIdentifierBasedOnNode(arrayRef);
        this.arrays[arrayRef.name] = true;
        this.nodes.push(this.buildVariableDeclaration(arrayRef, toArray));
      }

      for (let i = 0; i < pattern.elements.length; i++) {
        let elem = pattern.elements[i];
        if (!elem) continue;
        let elemRef;

        if (_babelCore().types.isRestElement(elem)) {
          elemRef = this.toArray(arrayRef);
          elemRef = _babelCore().types.callExpression(_babelCore().types.memberExpression(elemRef, _babelCore().types.identifier("slice")), [_babelCore().types.numericLiteral(i)]);
          elem = elem.argument;
        } else {
          elemRef = _babelCore().types.memberExpression(arrayRef, _babelCore().types.numericLiteral(i), true);
        }

        this.push(elem, elemRef);
      }
    }

    init(pattern, ref) {
      if (!_babelCore().types.isArrayExpression(ref) && !_babelCore().types.isMemberExpression(ref)) {
        const memo = this.scope.maybeGenerateMemoised(ref, true);

        if (memo) {
          this.nodes.push(this.buildVariableDeclaration(memo, _babelCore().types.cloneNode(ref)));
          ref = memo;
        }
      }

      this.push(pattern, ref);
      return this.nodes;
    }

  }

  return {
    visitor: {
      ExportNamedDeclaration(path) {
        const declaration = path.get("declaration");
        if (!declaration.isVariableDeclaration()) return;
        if (!variableDeclarationHasPattern(declaration.node)) return;
        const specifiers = [];

        for (const name in path.getOuterBindingIdentifiers(path)) {
          specifiers.push(_babelCore().types.exportSpecifier(_babelCore().types.identifier(name), _babelCore().types.identifier(name)));
        }

        path.replaceWith(declaration.node);
        path.insertAfter(_babelCore().types.exportNamedDeclaration(null, specifiers));
      },

      ForXStatement(path) {
        const {
          node,
          scope
        } = path;
        const left = node.left;

        if (_babelCore().types.isPattern(left)) {
          const temp = scope.generateUidIdentifier("ref");
          node.left = _babelCore().types.variableDeclaration("var", [_babelCore().types.variableDeclarator(temp)]);
          path.ensureBlock();
          node.body.body.unshift(_babelCore().types.variableDeclaration("var", [_babelCore().types.variableDeclarator(left, temp)]));
          return;
        }

        if (!_babelCore().types.isVariableDeclaration(left)) return;
        const pattern = left.declarations[0].id;
        if (!_babelCore().types.isPattern(pattern)) return;
        const key = scope.generateUidIdentifier("ref");
        node.left = _babelCore().types.variableDeclaration(left.kind, [_babelCore().types.variableDeclarator(key, null)]);
        const nodes = [];
        const destructuring = new DestructuringTransformer({
          kind: left.kind,
          scope: scope,
          nodes: nodes,
          arrayOnlySpread,
          addHelper: name => this.addHelper(name)
        });
        destructuring.init(pattern, key);
        path.ensureBlock();
        const block = node.body;
        block.body = nodes.concat(block.body);
      },

      CatchClause({
        node,
        scope
      }) {
        const pattern = node.param;
        if (!_babelCore().types.isPattern(pattern)) return;
        const ref = scope.generateUidIdentifier("ref");
        node.param = ref;
        const nodes = [];
        const destructuring = new DestructuringTransformer({
          kind: "let",
          scope: scope,
          nodes: nodes,
          arrayOnlySpread,
          addHelper: name => this.addHelper(name)
        });
        destructuring.init(pattern, ref);
        node.body.body = nodes.concat(node.body.body);
      },

      AssignmentExpression(path) {
        const {
          node,
          scope
        } = path;
        if (!_babelCore().types.isPattern(node.left)) return;
        const nodes = [];
        const destructuring = new DestructuringTransformer({
          operator: node.operator,
          scope: scope,
          nodes: nodes,
          arrayOnlySpread,
          addHelper: name => this.addHelper(name)
        });
        let ref;

        if (path.isCompletionRecord() || !path.parentPath.isExpressionStatement()) {
          ref = scope.generateUidIdentifierBasedOnNode(node.right, "ref");
          nodes.push(_babelCore().types.variableDeclaration("var", [_babelCore().types.variableDeclarator(ref, node.right)]));

          if (_babelCore().types.isArrayExpression(node.right)) {
            destructuring.arrays[ref.name] = true;
          }
        }

        destructuring.init(node.left, ref || node.right);

        if (ref) {
          nodes.push(_babelCore().types.expressionStatement(_babelCore().types.cloneNode(ref)));
        }

        path.replaceWithMultiple(nodes);
      },

      VariableDeclaration(path) {
        const {
          node,
          scope,
          parent
        } = path;
        if (_babelCore().types.isForXStatement(parent)) return;
        if (!parent || !path.container) return;
        if (!variableDeclarationHasPattern(node)) return;
        const nodeKind = node.kind;
        const nodes = [];
        let declar;

        for (let i = 0; i < node.declarations.length; i++) {
          declar = node.declarations[i];
          const patternId = declar.init;
          const pattern = declar.id;
          const destructuring = new DestructuringTransformer({
            blockHoist: node._blockHoist,
            nodes: nodes,
            scope: scope,
            kind: node.kind,
            arrayOnlySpread,
            addHelper: name => this.addHelper(name)
          });

          if (_babelCore().types.isPattern(pattern)) {
            destructuring.init(pattern, patternId);

            if (+i !== node.declarations.length - 1) {
              _babelCore().types.inherits(nodes[nodes.length - 1], declar);
            }
          } else {
            nodes.push(_babelCore().types.inherits(destructuring.buildVariableAssignment(declar.id, _babelCore().types.cloneNode(declar.init)), declar));
          }
        }

        let tail = null;
        const nodesOut = [];

        for (const node of nodes) {
          if (tail !== null && _babelCore().types.isVariableDeclaration(node)) {
            tail.declarations.push(...node.declarations);
          } else {
            node.kind = nodeKind;
            nodesOut.push(node);
            tail = _babelCore().types.isVariableDeclaration(node) ? node : null;
          }
        }

        for (const nodeOut of nodesOut) {
          if (!nodeOut.declarations) continue;

          for (const declaration of nodeOut.declarations) {
            const {
              name
            } = declaration.id;

            if (scope.bindings[name]) {
              scope.bindings[name].kind = nodeOut.kind;
            }
          }
        }

        if (nodesOut.length === 1) {
          path.replaceWith(nodesOut[0]);
        } else {
          path.replaceWithMultiple(nodesOut);
        }
      }

    }
  };
});

exports.default = _default;