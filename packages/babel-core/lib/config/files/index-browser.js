"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findConfigRoot = findConfigRoot;
exports.findPackageData = findPackageData;
exports.findRelativeConfig = findRelativeConfig;
exports.findRootConfig = findRootConfig;
exports.loadConfig = loadConfig;
exports.resolvePlugin = resolvePlugin;
exports.resolvePreset = resolvePreset;
exports.loadPlugin = loadPlugin;
exports.loadPreset = loadPreset;

function findConfigRoot(cwd) {
  throw new Error(`Cannot search for filesystem config root when running in a browser`);
}

function findPackageData(filepath) {
  return {
    filepath,
    directories: [],
    pkg: null,
    isPackage: false
  };
}

function findRelativeConfig(pkgData, envName, caller) {
  return {
    pkg: null,
    config: null,
    ignore: null
  };
}

function findRootConfig(dirname, envName, caller) {
  return null;
}

function loadConfig(name, dirname, envName, caller) {
  throw new Error(`Cannot load ${name} relative to ${dirname} in a browser`);
}

function resolvePlugin(name, dirname) {
  return null;
}

function resolvePreset(name, dirname) {
  return null;
}

function loadPlugin(name, dirname) {
  throw new Error(`Cannot load plugin ${name} relative to ${dirname} in a browser`);
}

function loadPreset(name, dirname) {
  throw new Error(`Cannot load preset ${name} relative to ${dirname} in a browser`);
}