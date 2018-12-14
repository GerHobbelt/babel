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

function _babelHelperCreateClassFeaturesPlugin() {
  const data = require("@gerhobbelt/babel-helper-create-class-features-plugin");

  _babelHelperCreateClassFeaturesPlugin = function () {
    return data;
  };

  return data;
}

var _default = (0, _babelHelperPluginUtils().declare)((api, options) => {
  api.assertVersion(7);
  return (0, _babelHelperCreateClassFeaturesPlugin().createClassFeaturePlugin)({
    name: "proposal-class-properties",
    feature: _babelHelperCreateClassFeaturesPlugin().FEATURES.fields,
    loose: options.loose,

    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("classProperties", "classPrivateProperties");
    }

  });
});

exports.default = _default;