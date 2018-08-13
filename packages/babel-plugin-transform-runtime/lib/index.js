"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "definitions", {
  enumerable: true,
  get: function () {
    return _definitions.default;
  }
});
exports.default = void 0;

function _babelHelperPluginUtils() {
  const data = require("@gerhobbelt/babel-helper-plugin-utils");

  _babelHelperPluginUtils = function () {
    return data;
  };

  return data;
}

function _babelHelperModuleImports() {
  const data = require("@gerhobbelt/babel-helper-module-imports");

  _babelHelperModuleImports = function () {
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

var _definitions = _interopRequireDefault(require("./definitions"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)((api, options) => {
  api.assertVersion(7);
  const {
    helpers,
    moduleName = "@gerhobbelt/babel-runtime",
    polyfill,
    regenerator,
    useBuiltIns,
    useESModules
  } = options;
  const regeneratorEnabled = regenerator !== false;
  const notPolyfillOrDoesUseBuiltIns = polyfill === false || useBuiltIns;
  const isPolyfillAndUseBuiltIns = polyfill && useBuiltIns;
  const baseHelpersDir = useBuiltIns ? "helpers/builtin" : "helpers";
  const helpersDir = useESModules ? `${baseHelpersDir}/es6` : baseHelpersDir;

  function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  const HEADER_HELPERS = ["interopRequireWildcard", "interopRequireDefault"];
  return {
    pre(file) {
      if (helpers !== false) {
        file.set("helperGenerator", name => {
          const isInteropHelper = HEADER_HELPERS.indexOf(name) !== -1;
          const blockHoist = isInteropHelper && !(0, _babelHelperModuleImports().isModule)(file.path) ? 4 : undefined;
          return this.addDefaultImport(`${moduleName}/${helpersDir}/${name}`, name, blockHoist);
        });
      }

      if (isPolyfillAndUseBuiltIns) {
        throw new Error("The polyfill option conflicts with useBuiltIns; use one or the other");
      }

      this.moduleName = moduleName;
      const cache = new Map();

      this.addDefaultImport = (source, nameHint, blockHoist) => {
        const cacheKey = (0, _babelHelperModuleImports().isModule)(file.path);
        const key = `${source}:${nameHint}:${cacheKey || ""}`;
        let cached = cache.get(key);

        if (cached) {
          cached = _babelCore().types.cloneNode(cached);
        } else {
          cached = (0, _babelHelperModuleImports().addDefault)(file.path, source, {
            importedInterop: "uncompiled",
            nameHint,
            blockHoist
          });
          cache.set(key, cached);
        }

        return cached;
      };
    },

    visitor: {
      ReferencedIdentifier(path) {
        const {
          node,
          parent,
          scope
        } = path;

        if (node.name === "regeneratorRuntime" && regeneratorEnabled) {
          path.replaceWith(this.addDefaultImport(`${this.moduleName}/regenerator`, "regeneratorRuntime"));
          return;
        }

        if (notPolyfillOrDoesUseBuiltIns) return;
        if (_babelCore().types.isMemberExpression(parent)) return;
        if (!has(_definitions.default.builtins, node.name)) return;
        if (scope.getBindingIdentifier(node.name)) return;
        path.replaceWith(this.addDefaultImport(`${moduleName}/core-js/${_definitions.default.builtins[node.name]}`, node.name));
      },

      CallExpression(path) {
        if (notPolyfillOrDoesUseBuiltIns) return;
        if (path.node.arguments.length) return;
        const callee = path.node.callee;
        if (!_babelCore().types.isMemberExpression(callee)) return;
        if (!callee.computed) return;

        if (!path.get("callee.property").matchesPattern("Symbol.iterator")) {
          return;
        }

        path.replaceWith(_babelCore().types.callExpression(this.addDefaultImport(`${moduleName}/core-js/get-iterator`, "getIterator"), [callee.object]));
      },

      BinaryExpression(path) {
        if (notPolyfillOrDoesUseBuiltIns) return;
        if (path.node.operator !== "in") return;
        if (!path.get("left").matchesPattern("Symbol.iterator")) return;
        path.replaceWith(_babelCore().types.callExpression(this.addDefaultImport(`${moduleName}/core-js/is-iterable`, "isIterable"), [path.node.right]));
      },

      MemberExpression: {
        enter(path) {
          if (notPolyfillOrDoesUseBuiltIns) return;
          if (!path.isReferenced()) return;
          const {
            node
          } = path;
          const obj = node.object;
          const prop = node.property;
          if (!_babelCore().types.isReferenced(obj, node)) return;
          if (node.computed) return;
          if (!has(_definitions.default.methods, obj.name)) return;
          const methods = _definitions.default.methods[obj.name];
          if (!has(methods, prop.name)) return;
          if (path.scope.getBindingIdentifier(obj.name)) return;

          if (obj.name === "Object" && prop.name === "defineProperty" && path.parentPath.isCallExpression()) {
            const call = path.parentPath.node;

            if (call.arguments.length === 3 && _babelCore().types.isLiteral(call.arguments[1])) {
              return;
            }
          }

          path.replaceWith(this.addDefaultImport(`${moduleName}/core-js/${methods[prop.name]}`, `${obj.name}$${prop.name}`));
        },

        exit(path) {
          if (notPolyfillOrDoesUseBuiltIns) return;
          if (!path.isReferenced()) return;
          const {
            node
          } = path;
          const obj = node.object;
          if (!has(_definitions.default.builtins, obj.name)) return;
          if (path.scope.getBindingIdentifier(obj.name)) return;
          path.replaceWith(_babelCore().types.memberExpression(this.addDefaultImport(`${moduleName}/core-js/${_definitions.default.builtins[obj.name]}`, obj.name), node.property, node.computed));
        }

      }
    }
  };
});

exports.default = _default;