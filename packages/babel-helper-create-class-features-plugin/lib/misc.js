"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectInitialization = injectInitialization;
exports.extractComputedKeys = extractComputedKeys;

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

const findBareSupers = _babelCore().traverse.visitors.merge([{
  Super(path) {
    const {
      node,
      parentPath
    } = path;

    if (parentPath.isCallExpression({
      callee: node
    })) {
      this.push(parentPath);
    }
  }

}, _babelHelperReplaceSupers().environmentVisitor]);

const referenceVisitor = {
  "TSTypeAnnotation|TypeAnnotation"(path) {
    path.skip();
  },

  ReferencedIdentifier(path) {
    if (this.scope.hasOwnBinding(path.node.name)) {
      this.scope.rename(path.node.name);
      path.skip();
    }
  }

};

const classFieldDefinitionEvaluationTDZVisitor = _babelCore().traverse.visitors.merge([{
  ReferencedIdentifier(path) {
    if (this.classBinding && this.classBinding === path.scope.getBinding(path.node.name)) {
      const classNameTDZError = this.file.addHelper("classNameTDZError");

      const throwNode = _babelCore().types.callExpression(classNameTDZError, [_babelCore().types.stringLiteral(path.node.name)]);

      path.replaceWith(_babelCore().types.sequenceExpression([throwNode, path.node]));
      path.skip();
    }
  }

}, _babelHelperReplaceSupers().environmentVisitor]);

function injectInitialization(path, constructor, nodes, renamer) {
  if (!nodes.length) return;
  const isDerived = !!path.node.superClass;

  if (!constructor) {
    const newConstructor = _babelCore().types.classMethod("constructor", _babelCore().types.identifier("constructor"), [], _babelCore().types.blockStatement([]));

    if (isDerived) {
      newConstructor.params = [_babelCore().types.restElement(_babelCore().types.identifier("args"))];
      newConstructor.body.body.push(_babelCore().template.statement.ast`super(...args)`);
    }

    [constructor] = path.get("body").unshiftContainer("body", newConstructor);
  }

  if (renamer) {
    renamer(referenceVisitor, {
      scope: constructor.scope
    });
  }

  if (isDerived) {
    const bareSupers = [];
    constructor.traverse(findBareSupers, bareSupers);

    for (const bareSuper of bareSupers) {
      bareSuper.insertAfter(nodes);
    }
  } else {
    constructor.get("body").unshiftContainer("body", nodes);
  }
}

function extractComputedKeys(ref, path, computedPaths, file) {
  const declarations = [];

  for (const computedPath of computedPaths) {
    computedPath.traverse(classFieldDefinitionEvaluationTDZVisitor, {
      classBinding: path.node.id && path.scope.getBinding(path.node.id.name),
      file
    });
    const computedNode = computedPath.node;

    if (!computedPath.get("key").isConstantExpression()) {
      const ident = path.scope.generateUidIdentifierBasedOnNode(computedNode.key);
      declarations.push(_babelCore().types.variableDeclaration("var", [_babelCore().types.variableDeclarator(ident, computedNode.key)]));
      computedNode.key = _babelCore().types.cloneNode(ident);
    }
  }

  return declarations;
}