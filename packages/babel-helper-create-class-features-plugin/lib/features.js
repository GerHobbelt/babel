"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.enableFeature = enableFeature;
exports.isLoose = isLoose;
exports.verifyUsedFeatures = verifyUsedFeatures;
exports.FEATURES = void 0;

var _decorators = require("./decorators");

const FEATURES = Object.freeze({
  fields: 1 << 1,
  privateMethods: 1 << 2,
  decorators: 1 << 3
});
exports.FEATURES = FEATURES;
const featuresKey = "@gerhobbelt/babel-plugin-class-features/featuresKey";
const looseKey = "@gerhobbelt/babel-plugin-class-features/looseKey";

function enableFeature(file, feature, loose) {
  if (!hasFeature(file, feature)) {
    file.set(featuresKey, file.get(featuresKey) | feature);
    if (loose) file.set(looseKey, file.get(looseKey) | feature);
  }
}

function hasFeature(file, feature) {
  return !!(file.get(featuresKey) & feature);
}

function isLoose(file, feature) {
  return !!(file.get(looseKey) & feature);
}

function verifyUsedFeatures(path, file) {
  if ((0, _decorators.hasOwnDecorators)(path)) {
    if (!hasFeature(file, FEATURES.decorators)) {
      throw path.buildCodeFrameError("Decorators are not enabled.");
    }

    if (path.isPrivate()) {
      throw path.buildCodeFrameError(`Private ${path.isClassMethod() ? "methods" : "fields"} in decorated classes are not supported yet.`);
    }
  }

  if (path.isPrivate() && path.isMethod()) {
    if (!hasFeature(file, FEATURES.privateMethods)) {
      throw path.buildCodeFrameError("Class private methods are not enabled.");
    }

    if (path.node.static) {
      throw path.buildCodeFrameError("@gerhobbelt/babel-plugin-class-features doesn't support class static private methods yet.");
    }

    if (path.node.kind !== "method") {
      throw path.buildCodeFrameError("@gerhobbelt/babel-plugin-class-features doesn't support class private accessors yet.");
    }
  }

  if (hasFeature(file, FEATURES.privateMethods) && hasFeature(file, FEATURES.fields) && isLoose(file, FEATURES.privateMethods) !== isLoose(file, FEATURES.fields)) {
    throw path.buildCodeFrameError("'loose' mode configuration must be the same for both @gerhobbelt/babel-plugin-proposal-class-properties " + "and @gerhobbelt/babel-plugin-proposal-private-methods");
  }

  if (path.isProperty()) {
    if (!hasFeature(file, FEATURES.fields)) {
      throw path.buildCodeFrameError("Class fields are not enabled.");
    }
  }
}