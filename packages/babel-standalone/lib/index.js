"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transform = transform;
exports.transformFromAst = transformFromAst;
exports.registerPlugin = registerPlugin;
exports.registerPlugins = registerPlugins;
exports.registerPreset = registerPreset;
exports.registerPresets = registerPresets;
exports.transformScriptTags = transformScriptTags;
exports.disableScriptTags = disableScriptTags;
exports.version = exports.buildExternalHelpers = exports.availablePresets = exports.availablePlugins = void 0;

function Babel() {
  const data = _interopRequireWildcard(require("@gerhobbelt/babel-core"));

  Babel = function () {
    return data;
  };

  return data;
}

var _transformScriptTags = require("./transformScriptTags");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const isArray = Array.isArray || (arg => Object.prototype.toString.call(arg) === "[object Array]");

function loadBuiltin(builtinTable, name) {
  if (isArray(name) && typeof name[0] === "string") {
    if (builtinTable.hasOwnProperty(name[0])) {
      return [builtinTable[name[0]]].concat(name.slice(1));
    }

    return;
  } else if (typeof name === "string") {
    return builtinTable[name];
  }

  return name;
}

function processOptions(options) {
  const presets = (options.presets || []).map(presetName => {
    const preset = loadBuiltin(availablePresets, presetName);

    if (preset) {
      if (isArray(preset) && typeof preset[0] === "object" && preset[0].hasOwnProperty("buildPreset")) {
        preset[0] = Object.assign({}, preset[0], {
          buildPreset: preset[0].buildPreset
        });
      }
    } else {
      throw new Error(`Invalid preset specified in Babel options: "${presetName}"`);
    }

    return preset;
  });
  const plugins = (options.plugins || []).map(pluginName => {
    const plugin = loadBuiltin(availablePlugins, pluginName);

    if (!plugin) {
      throw new Error(`Invalid plugin specified in Babel options: "${pluginName}"`);
    }

    return plugin;
  });
  return Object.assign({
    babelrc: false
  }, options, {
    presets,
    plugins
  });
}

function transform(code, options) {
  return Babel().transform(code, processOptions(options));
}

function transformFromAst(ast, code, options) {
  return Babel().transformFromAst(ast, code, processOptions(options));
}

const availablePlugins = {};
exports.availablePlugins = availablePlugins;
const availablePresets = {};
exports.availablePresets = availablePresets;
const buildExternalHelpers = Babel().buildExternalHelpers;
exports.buildExternalHelpers = buildExternalHelpers;

function registerPlugin(name, plugin) {
  if (availablePlugins.hasOwnProperty(name)) {
    console.warn(`A plugin named "${name}" is already registered, it will be overridden`);
  }

  availablePlugins[name] = plugin;
}

function registerPlugins(newPlugins) {
  Object.keys(newPlugins).forEach(name => registerPlugin(name, newPlugins[name]));
}

function registerPreset(name, preset) {
  if (availablePresets.hasOwnProperty(name)) {
    console.warn(`A preset named "${name}" is already registered, it will be overridden`);
  }

  availablePresets[name] = preset;
}

function registerPresets(newPresets) {
  Object.keys(newPresets).forEach(name => registerPreset(name, newPresets[name]));
}

registerPlugins({
  "external-helpers": require("@gerhobbelt/babel-plugin-external-helpers"),
  "syntax-async-generators": require("@gerhobbelt/babel-plugin-syntax-async-generators"),
  "syntax-class-properties": require("@gerhobbelt/babel-plugin-syntax-class-properties"),
  "syntax-decorators": require("@gerhobbelt/babel-plugin-syntax-decorators"),
  "syntax-do-expressions": require("@gerhobbelt/babel-plugin-syntax-do-expressions"),
  "syntax-dynamic-import": require("@gerhobbelt/babel-plugin-syntax-dynamic-import"),
  "syntax-export-default-from": require("@gerhobbelt/babel-plugin-syntax-export-default-from"),
  "syntax-export-namespace-from": require("@gerhobbelt/babel-plugin-syntax-export-namespace-from"),
  "syntax-flow": require("@gerhobbelt/babel-plugin-syntax-flow"),
  "syntax-function-bind": require("@gerhobbelt/babel-plugin-syntax-function-bind"),
  "syntax-function-sent": require("@gerhobbelt/babel-plugin-syntax-function-sent"),
  "syntax-import-meta": require("@gerhobbelt/babel-plugin-syntax-import-meta"),
  "syntax-jsx": require("@gerhobbelt/babel-plugin-syntax-jsx"),
  "syntax-object-rest-spread": require("@gerhobbelt/babel-plugin-syntax-object-rest-spread"),
  "syntax-optional-catch-binding": require("@gerhobbelt/babel-plugin-syntax-optional-catch-binding"),
  "syntax-pipeline-operator": require("@gerhobbelt/babel-plugin-syntax-pipeline-operator"),
  "syntax-typescript": require("@gerhobbelt/babel-plugin-syntax-typescript"),
  "transform-async-to-generator": require("@gerhobbelt/babel-plugin-transform-async-to-generator"),
  "proposal-async-generator-functions": require("@gerhobbelt/babel-plugin-proposal-async-generator-functions"),
  "proposal-class-properties": require("@gerhobbelt/babel-plugin-proposal-class-properties"),
  "proposal-decorators": require("@gerhobbelt/babel-plugin-proposal-decorators"),
  "proposal-do-expressions": require("@gerhobbelt/babel-plugin-proposal-do-expressions"),
  "proposal-export-default-from": require("@gerhobbelt/babel-plugin-proposal-export-default-from"),
  "proposal-export-namespace-from": require("@gerhobbelt/babel-plugin-proposal-export-namespace-from"),
  "proposal-pipeline-operator": require("@gerhobbelt/babel-plugin-proposal-pipeline-operator"),
  "proposal-private-methods": require("@gerhobbelt/babel-plugin-proposal-private-methods"),
  "transform-arrow-functions": require("@gerhobbelt/babel-plugin-transform-arrow-functions"),
  "transform-block-scoped-functions": require("@gerhobbelt/babel-plugin-transform-block-scoped-functions"),
  "transform-block-scoping": require("@gerhobbelt/babel-plugin-transform-block-scoping"),
  "transform-classes": require("@gerhobbelt/babel-plugin-transform-classes"),
  "transform-computed-properties": require("@gerhobbelt/babel-plugin-transform-computed-properties"),
  "transform-destructuring": require("@gerhobbelt/babel-plugin-transform-destructuring"),
  "transform-dotall-regex": require("@gerhobbelt/babel-plugin-transform-dotall-regex"),
  "transform-duplicate-keys": require("@gerhobbelt/babel-plugin-transform-duplicate-keys"),
  "transform-for-of": require("@gerhobbelt/babel-plugin-transform-for-of"),
  "transform-function-name": require("@gerhobbelt/babel-plugin-transform-function-name"),
  "transform-instanceof": require("@gerhobbelt/babel-plugin-transform-instanceof"),
  "transform-literals": require("@gerhobbelt/babel-plugin-transform-literals"),
  "transform-modules-amd": require("@gerhobbelt/babel-plugin-transform-modules-amd"),
  "transform-modules-commonjs": require("@gerhobbelt/babel-plugin-transform-modules-commonjs"),
  "transform-modules-systemjs": require("@gerhobbelt/babel-plugin-transform-modules-systemjs"),
  "transform-modules-umd": require("@gerhobbelt/babel-plugin-transform-modules-umd"),
  "transform-object-super": require("@gerhobbelt/babel-plugin-transform-object-super"),
  "transform-parameters": require("@gerhobbelt/babel-plugin-transform-parameters"),
  "transform-shorthand-properties": require("@gerhobbelt/babel-plugin-transform-shorthand-properties"),
  "transform-spread": require("@gerhobbelt/babel-plugin-transform-spread"),
  "transform-sticky-regex": require("@gerhobbelt/babel-plugin-transform-sticky-regex"),
  "transform-template-literals": require("@gerhobbelt/babel-plugin-transform-template-literals"),
  "transform-typeof-symbol": require("@gerhobbelt/babel-plugin-transform-typeof-symbol"),
  "transform-typescript": require("@gerhobbelt/babel-plugin-transform-typescript"),
  "transform-unicode-regex": require("@gerhobbelt/babel-plugin-transform-unicode-regex"),
  "transform-member-expression-literals": require("@gerhobbelt/babel-plugin-transform-member-expression-literals"),
  "transform-property-literals": require("@gerhobbelt/babel-plugin-transform-property-literals"),
  "transform-property-mutators": require("@gerhobbelt/babel-plugin-transform-property-mutators"),
  "transform-exponentiation-operator": require("@gerhobbelt/babel-plugin-transform-exponentiation-operator"),
  "transform-flow-comments": require("@gerhobbelt/babel-plugin-transform-flow-comments"),
  "transform-flow-strip-types": require("@gerhobbelt/babel-plugin-transform-flow-strip-types"),
  "proposal-function-bind": require("@gerhobbelt/babel-plugin-proposal-function-bind"),
  "transform-jscript": require("@gerhobbelt/babel-plugin-transform-jscript"),
  "transform-new-target": require("@gerhobbelt/babel-plugin-transform-new-target"),
  "transform-object-assign": require("@gerhobbelt/babel-plugin-transform-object-assign"),
  "proposal-object-rest-spread": require("@gerhobbelt/babel-plugin-proposal-object-rest-spread"),
  "transform-object-set-prototype-of-to-assign": require("@gerhobbelt/babel-plugin-transform-object-set-prototype-of-to-assign"),
  "proposal-optional-catch-binding": require("@gerhobbelt/babel-plugin-proposal-optional-catch-binding"),
  "transform-proto-to-assign": require("@gerhobbelt/babel-plugin-transform-proto-to-assign"),
  "transform-react-constant-elements": require("@gerhobbelt/babel-plugin-transform-react-constant-elements"),
  "transform-react-display-name": require("@gerhobbelt/babel-plugin-transform-react-display-name"),
  "transform-react-inline-elements": require("@gerhobbelt/babel-plugin-transform-react-inline-elements"),
  "transform-react-jsx": require("@gerhobbelt/babel-plugin-transform-react-jsx"),
  "transform-react-jsx-compat": require("@gerhobbelt/babel-plugin-transform-react-jsx-compat"),
  "transform-react-jsx-self": require("@gerhobbelt/babel-plugin-transform-react-jsx-self"),
  "transform-react-jsx-source": require("@gerhobbelt/babel-plugin-transform-react-jsx-source"),
  "transform-regenerator": require("@gerhobbelt/babel-plugin-transform-regenerator"),
  "transform-runtime": require("@gerhobbelt/babel-plugin-transform-runtime"),
  "transform-strict-mode": require("@gerhobbelt/babel-plugin-transform-strict-mode"),
  "proposal-unicode-property-regex": require("@gerhobbelt/babel-plugin-proposal-unicode-property-regex")
});
registerPresets({
  es2015: require("./preset-es2015"),
  es2016: () => {
    return {
      plugins: [availablePlugins["transform-exponentiation-operator"]]
    };
  },
  es2017: () => {
    return {
      plugins: [availablePlugins["transform-async-to-generator"]]
    };
  },
  react: require("@gerhobbelt/babel-preset-react"),
  "stage-0": require("./preset-stage-0"),
  "stage-1": require("./preset-stage-1"),
  "stage-2": require("./preset-stage-2"),
  "stage-3": require("./preset-stage-3"),
  "es2015-loose": {
    presets: [[require("./preset-es2015"), {
      loose: true
    }]]
  },
  "es2015-no-commonjs": {
    presets: [[require("./preset-es2015"), {
      modules: false
    }]]
  },
  typescript: require("@gerhobbelt/babel-preset-typescript"),
  flow: require("@gerhobbelt/babel-preset-flow")
});
const version = VERSION;
exports.version = version;

function onDOMContentLoaded() {
  transformScriptTags();
}

if (typeof window !== "undefined" && window && window.addEventListener) {
  window.addEventListener("DOMContentLoaded", onDOMContentLoaded, false);
}

function transformScriptTags(scriptTags) {
  (0, _transformScriptTags.runScripts)(transform, scriptTags);
}

function disableScriptTags() {
  window.removeEventListener("DOMContentLoaded", onDOMContentLoaded);
}