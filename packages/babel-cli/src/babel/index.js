#!/usr/bin/env node

import parseArgv from "./options";
import dirCommand from "./dir";
import fileCommand from "./file";
import buildDebug from "@gerhobbelt/debug";

const debug = buildDebug("babel:cli");

const opts = parseArgv(process.argv);

// set up the babel DEBUG logging mode:
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
buildDebug.enable(debugCriteria);

debug("CLI-START:", JSON.stringify(opts, null, 2));

const fn = opts.cliOptions.outDir ? dirCommand : fileCommand;
fn(opts).catch(err => {
  console.error(err);
  process.exit(1);
});
