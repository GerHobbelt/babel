#!/usr/bin/env node
"use strict";

var _options = _interopRequireDefault(require("./options"));

var _dir = _interopRequireDefault(require("./dir"));

var _file = _interopRequireDefault(require("./file"));

function _debug() {
  const data = _interopRequireDefault(require("@gerhobbelt/debug"));

  _debug = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug().default)("babel:cli");
const opts = (0, _options.default)(process.argv);
let debugCriteria = process.env && process.env.DEBUG;

if (!debugCriteria) {
  switch (typeof opts.cliOptions.debug) {
    case "string":
      debugCriteria = opts.cliOptions.debug;
      break;

    case "boolean":
      debugCriteria = opts.cliOptions.debug ? "*" : "";
      break;

    default:
      if (opts.cliOptions.debug != null) {
        throw new Error("cliOptions.debug MUST be boolean or string type");
      }

      break;
  }
}

if (!debugCriteria) {
  debugCriteria = "";
}

_debug().default.enable(debugCriteria);

debug("CLI-START:", JSON.stringify(opts, null, 2));
const fn = opts.cliOptions.outDir ? _dir.default : _file.default;
fn(opts).catch(err => {
  console.error(err);
  process.exit(1);
});