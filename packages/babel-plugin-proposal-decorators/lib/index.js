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

function _babelPluginSyntaxDecorators() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-plugin-syntax-decorators"));

  _babelPluginSyntaxDecorators = function () {
    return data;
  };

  return data;
}

function _babelHelperCreateClassFeaturesPlugin() {
  const data = require("@gerhobbelt/babel-helper-create-class-features-plugin");

  _babelHelperCreateClassFeaturesPlugin = function () {
    return data;
  };

  return data;
}

var _transformerLegacy = _interopRequireDefault(require("./transformer-legacy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _babelHelperPluginUtils().declare)((api, options) => {
  api.assertVersion(7);
  const {
    legacy = false
  } = options;

  if (typeof legacy !== "boolean") {
    throw new Error("'legacy' must be a boolean.");
  }

  const {
    decoratorsBeforeExport
  } = options;

  if (decoratorsBeforeExport === undefined) {
    if (!legacy) {
      throw new Error("The decorators plugin requires a 'decoratorsBeforeExport' option," + " whose value must be a boolean. If you want to use the legacy" + " decorators semantics, you can set the 'legacy: true' option.");
    }
  } else {
    if (legacy) {
      throw new Error("'decoratorsBeforeExport' can't be used with legacy decorators.");
    }

    if (typeof decoratorsBeforeExport !== "boolean") {
      throw new Error("'decoratorsBeforeExport' must be a boolean.");
    }
  }

  if (legacy) {
    return {
      name: "proposal-decorators",
      inherits: _babelPluginSyntaxDecorators().default,

      manipulateOptions({
        generatorOpts
      }) {
        generatorOpts.decoratorsBeforeExport = decoratorsBeforeExport;
      },

      visitor: _transformerLegacy.default
    };
  }

  return (0, _babelHelperCreateClassFeaturesPlugin().createClassFeaturePlugin)({
    name: "proposal-decorators",
    feature: _babelHelperCreateClassFeaturesPlugin().FEATURES.decorators,

    manipulateOptions({
      generatorOpts,
      parserOpts
    }) {
      parserOpts.plugins.push(["decorators", {
        decoratorsBeforeExport
      }]);
      generatorOpts.decoratorsBeforeExport = decoratorsBeforeExport;
    }

  });
});

exports.default = _default;