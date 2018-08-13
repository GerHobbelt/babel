"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _babelPluginTransformTemplateLiterals() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-template-literals"));

  _babelPluginTransformTemplateLiterals = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformLiterals() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-literals"));

  _babelPluginTransformLiterals = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformFunctionName() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-function-name"));

  _babelPluginTransformFunctionName = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformArrowFunctions() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-arrow-functions"));

  _babelPluginTransformArrowFunctions = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformBlockScopedFunctions() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-block-scoped-functions"));

  _babelPluginTransformBlockScopedFunctions = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformClasses() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-classes"));

  _babelPluginTransformClasses = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformObjectSuper() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-object-super"));

  _babelPluginTransformObjectSuper = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformShorthandProperties() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-shorthand-properties"));

  _babelPluginTransformShorthandProperties = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformDuplicateKeys() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-duplicate-keys"));

  _babelPluginTransformDuplicateKeys = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformComputedProperties() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-computed-properties"));

  _babelPluginTransformComputedProperties = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformForOf() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-for-of"));

  _babelPluginTransformForOf = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformStickyRegex() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-sticky-regex"));

  _babelPluginTransformStickyRegex = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformUnicodeRegex() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-unicode-regex"));

  _babelPluginTransformUnicodeRegex = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformSpread() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-spread"));

  _babelPluginTransformSpread = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformParameters() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-parameters"));

  _babelPluginTransformParameters = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformDestructuring() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-destructuring"));

  _babelPluginTransformDestructuring = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformBlockScoping() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-block-scoping"));

  _babelPluginTransformBlockScoping = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformTypeofSymbol() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-typeof-symbol"));

  _babelPluginTransformTypeofSymbol = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformModulesCommonjs() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-modules-commonjs"));

  _babelPluginTransformModulesCommonjs = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformModulesSystemjs() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-modules-systemjs"));

  _babelPluginTransformModulesSystemjs = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformModulesAmd() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-modules-amd"));

  _babelPluginTransformModulesAmd = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformModulesUmd() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-modules-umd"));

  _babelPluginTransformModulesUmd = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformInstanceof() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-instanceof"));

  _babelPluginTransformInstanceof = function () {
    return data;
  };

  return data;
}

function _babelPluginTransformRegenerator() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-transform-regenerator"));

  _babelPluginTransformRegenerator = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (_, opts) => {
  const moduleTypes = ["commonjs", "cjs", "amd", "umd", "systemjs"];
  let loose = false;
  let modules = "commonjs";
  let spec = false;

  if (opts !== undefined) {
    if (opts.loose !== undefined) loose = opts.loose;
    if (opts.modules !== undefined) modules = opts.modules;
    if (opts.spec !== undefined) spec = opts.spec;
  }

  if (typeof loose !== "boolean") {
    throw new Error("Preset es2015 'loose' option must be a boolean.");
  }

  if (typeof spec !== "boolean") {
    throw new Error("Preset es2015 'spec' option must be a boolean.");
  }

  if (modules !== false && moduleTypes.indexOf(modules) === -1) {
    throw new Error("Preset es2015 'modules' option must be 'false' to indicate no modules\n" + "or a module type which be be one of: 'commonjs' (default), 'amd', 'umd', 'systemjs'");
  }

  const optsLoose = {
    loose
  };
  return {
    plugins: [[_babelPluginTransformTemplateLiterals().default, {
      loose,
      spec
    }], _babelPluginTransformLiterals().default, _babelPluginTransformFunctionName().default, [_babelPluginTransformArrowFunctions().default, {
      spec
    }], _babelPluginTransformBlockScopedFunctions().default, [_babelPluginTransformClasses().default, optsLoose], _babelPluginTransformObjectSuper().default, _babelPluginTransformShorthandProperties().default, _babelPluginTransformDuplicateKeys().default, [_babelPluginTransformComputedProperties().default, optsLoose], [_babelPluginTransformForOf().default, optsLoose], _babelPluginTransformStickyRegex().default, _babelPluginTransformUnicodeRegex().default, [_babelPluginTransformSpread().default, optsLoose], [_babelPluginTransformParameters().default, optsLoose], [_babelPluginTransformDestructuring().default, optsLoose], _babelPluginTransformBlockScoping().default, _babelPluginTransformTypeofSymbol().default, _babelPluginTransformInstanceof().default, (modules === "commonjs" || modules === "cjs") && [_babelPluginTransformModulesCommonjs().default, optsLoose], modules === "systemjs" && [_babelPluginTransformModulesSystemjs().default, optsLoose], modules === "amd" && [_babelPluginTransformModulesAmd().default, optsLoose], modules === "umd" && [_babelPluginTransformModulesUmd().default, optsLoose], [_babelPluginTransformRegenerator().default, {
      async: false,
      asyncGenerators: false
    }]].filter(Boolean)
  };
};

exports.default = _default;