"use strict";

require("core-js/shim");

require("regenerator-runtime/runtime");

if (global._babelPolyfill && typeof console !== "undefined" && console.warn) {
  console.warn("@gerhobbelt/babel-polyfill is loaded more than once on this page. This is probably not desirable/intended " + "and may have consequences if different versions of the polyfills are applied sequentially. " + "If you do need to load the polyfill more than once, use @gerhobbelt/babel-polyfill/noConflict " + "instead to bypass the warning.");
}

global._babelPolyfill = true;