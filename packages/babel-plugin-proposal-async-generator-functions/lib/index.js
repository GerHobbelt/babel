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

function _babelHelperRemapAsyncToGenerator() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-remap-async-to-generator"));

  _babelHelperRemapAsyncToGenerator = function () {
    return data;
  };

  return data;
}

function _babelPluginSyntaxAsyncGenerators() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-async-generators"));

  _babelPluginSyntaxAsyncGenerators = function () {
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

var _forAwait = _interopRequireDefault(require("./for-await"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)(api => {
  api.assertVersion(7);
  const yieldStarVisitor = {
    Function(path) {
      path.skip();
    },

    YieldExpression({
      node
    }, state) {
      if (!node.delegate) return;
      const callee = state.addHelper("asyncGeneratorDelegate");
      node.argument = _babelCore().types.callExpression(callee, [_babelCore().types.callExpression(state.addHelper("asyncIterator"), [node.argument]), state.addHelper("awaitAsyncGenerator")]);
    }

  };
  const forAwaitVisitor = {
    Function(path) {
      path.skip();
    },

    ForOfStatement(path, {
      file
    }) {
      const {
        node
      } = path;
      if (!node.await) return;
      const build = (0, _forAwait.default)(path, {
        getAsyncIterator: file.addHelper("asyncIterator")
      });
      const {
        declar,
        loop
      } = build;
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
      } else {
        path.replaceWithMultiple(build.node);
      }
    }

  };
  const visitor = {
    Function(path, state) {
      if (!path.node.async) return;
      path.traverse(forAwaitVisitor, state);
      if (!path.node.generator) return;
      path.traverse(yieldStarVisitor, state);
      (0, _babelHelperRemapAsyncToGenerator().default)(path, {
        wrapAsync: state.addHelper("wrapAsyncGenerator"),
        wrapAwait: state.addHelper("awaitAsyncGenerator")
      });
    }

  };
  return {
    name: "proposal-async-generator-functions",
    inherits: _babelPluginSyntaxAsyncGenerators().default,
    visitor: {
      Program(path, state) {
        path.traverse(visitor, state);
      }

    }
  };
});

exports.default = _default;