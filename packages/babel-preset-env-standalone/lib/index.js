"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = void 0;

function _babelStandalone() {
  const data = require("@gerhobbelt/babel-standalone");

  _babelStandalone = function () {
    return data;
  };

  return data;
}

function _babelPresetEnv() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-preset-env"));

  _babelPresetEnv = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _babelStandalone().registerPreset)("env", _babelPresetEnv().default);
const version = VERSION;
exports.version = version;