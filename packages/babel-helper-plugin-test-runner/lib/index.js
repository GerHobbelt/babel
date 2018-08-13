"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _babelHelperTransformFixtureTestRunner() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-transform-fixture-test-runner"));

  _babelHelperTransformFixtureTestRunner = function () {
    return data;
  };

  return data;
}

function _path() {
  const data = _interopRequireDefault(require("path"));

  _path = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(loc) {
  const name = _path().default.basename(_path().default.dirname(loc));

  (0, _babelHelperTransformFixtureTestRunner().default)(loc + "/fixtures", name);
}