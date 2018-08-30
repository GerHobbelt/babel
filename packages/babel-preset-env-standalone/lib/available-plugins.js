"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _babelStandalone() {
  const data = require("@gerhobbelt/babel-standalone");

  _babelStandalone = function () {
    return data;
  };

  return data;
}

const notIncludedPlugins = {
  "transform-new-target": require("@gerhobbelt/babel-plugin-transform-new-target"),
  "proposal-json-strings": require("@gerhobbelt/babel-plugin-proposal-json-strings")
};
Object.keys(notIncludedPlugins).forEach(pluginName => {
  if (!_babelStandalone().availablePlugins[pluginName]) {
    (0, _babelStandalone().registerPlugin)(pluginName, notIncludedPlugins[pluginName]);
  }
});

var _default = _babelStandalone().availablePlugins;

exports.default = _default;