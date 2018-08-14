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
    corejs: corejsVersion = false,
    helpers: useRuntimeHelpers = true,
    regenerator: useRuntimeRegenerator = true,
    useESModules = false,
    version: runtimeVersion = "7.0.0-beta.0"
  } = options;

  if (typeof useRuntimeRegenerator !== "boolean") {
    throw new Error("The 'regenerator' option must be undefined, or a boolean.");
  }

  if (typeof useRuntimeHelpers !== "boolean") {
    throw new Error("The 'helpers' option must be undefined, or a boolean.");
  }

  if (typeof useESModules !== "boolean") {
    throw new Error("The 'useESModules' option must be undefined, or a boolean.");
  }

  if (corejsVersion !== false && (typeof corejsVersion !== "number" || corejsVersion !== 2) && (typeof corejsVersion !== "string" || corejsVersion !== "2")) {
    throw new Error(`The 'corejs' option must be undefined, false, or 2, or '2', ` + `but got ${JSON.stringify(corejsVersion)}.`);
  }

  function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  if (has(options, "useBuiltIns")) {
    if (options.useBuiltIns) {
      throw new Error("The 'useBuiltIns' option has been removed. The @gerhobbelt/babel-runtime " + "module now uses builtins by default.");
    } else {
      throw new Error("The 'useBuiltIns' option has been removed. Use the 'corejs'" + "option with value '2' to polyfill with CoreJS 2.x via @gerhobbelt/babel-runtime.");
    }
  }

  if (has(options, "polyfill")) {
    if (options.polyfill === false) {
      throw new Error("The 'polyfill' option has been removed. The @gerhobbelt/babel-runtime " + "module now skips polyfilling by default.");
    } else {
      throw new Error("The 'polyfill' option has been removed. Use the 'corejs'" + "option with value '2' to polyfill with CoreJS 2.x via @gerhobbelt/babel-runtime.");
    }
  }

  if (has(options, "moduleName")) {
    throw new Error("The 'moduleName' option has been removed. @gerhobbelt/babel-transform-runtime " + "no longer supports arbitrary runtimes.");
  }

  const helpersDir = useESModules ? "helpers/esm" : "helpers";
  const injectCoreJS2 = `${corejsVersion}` === "2";
  const moduleName = injectCoreJS2 ? "@gerhobbelt/babel-runtime-corejs2" : "@gerhobbelt/babel-runtime";
  const HEADER_HELPERS = ["interopRequireWildcard", "interopRequireDefault"];
  return {
    pre(file) {
      if (useRuntimeHelpers) {
        file.set("helperGenerator", name => {
          if (file.availableHelper && !file.availableHelper(name, runtimeVersion)) {
            return;
          }

          const isInteropHelper = HEADER_HELPERS.indexOf(name) !== -1;
          const blockHoist = isInteropHelper && !(0, _babelHelperModuleImports().isModule)(file.path) ? 4 : undefined;
          return this.addDefaultImport(`${moduleName}/${helpersDir}/${name}`, name, blockHoist);
        });
      }

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

        if (node.name === "regeneratorRuntime" && useRuntimeRegenerator) {
          path.replaceWith(this.addDefaultImport(`${moduleName}/regenerator`, "regeneratorRuntime"));
          return;
        }

        if (!injectCoreJS2) return;
        if (_babelCore().types.isMemberExpression(parent)) return;
        if (!has(_definitions.default.builtins, node.name)) return;
        if (scope.getBindingIdentifier(node.name)) return;
        path.replaceWith(this.addDefaultImport(`${moduleName}/core-js/${_definitions.default.builtins[node.name]}`, node.name));
      },

      CallExpression(path) {
        if (!injectCoreJS2) return;
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
        if (!injectCoreJS2) return;
        if (path.node.operator !== "in") return;
        if (!path.get("left").matchesPattern("Symbol.iterator")) return;
        path.replaceWith(_babelCore().types.callExpression(this.addDefaultImport(`${moduleName}/core-js/is-iterable`, "isIterable"), [path.node.right]));
      },

      MemberExpression: {
        enter(path) {
          if (!injectCoreJS2) return;
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
          if (!injectCoreJS2) return;
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