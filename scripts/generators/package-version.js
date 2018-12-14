/**
 * Update the version numbers and package references in every `package.json`
 * file, according to the versioning *I* (@gerhobbelt) use.
 *
 * Run this script as part of the version-bumping process for a new babel release.
 */

const { join } = require("path");
const { readdirSync, readFileSync, writeFileSync } = require("fs");

const cwd = process.cwd();

const packageDir = join(cwd, "packages");
const codemodDir = join(cwd, "codemods");

const packages = readdirSync(packageDir);
const codemods = readdirSync(codemodDir);

const babelVersion = require(join(cwd, "lerna.json")).version;
console.log("Updating version of all babel packages to", babelVersion);

// pick up the peerDependencies clause from packages/babel-core:
const babelPeerDependencyClause = (() => {
  const packageJson = require(join(cwd, "lerna.json"));
  return packageJson.peerDependencies["@gerhobbelt/babel-core"];
})();
console.log(
  "Updating all peerDependencies of all babel packages to the expression:",
  babelPeerDependencyClause
);

function patchPackageJson(filePath, settings = {}) {
  const packageJson = readFileSync(filePath, "utf8");

  // apply patches:
  let updatedPackageJson = packageJson
    .replace(/"(@gerhobbelt\/babel-.*?)": "([^~]?[0-9.a-z-]+)"/g, (
      m,
      m1 /*, m2 */
    ) => {
      return `"${m1}": "${babelVersion}"`;
    })
    // version patches:
    .replace(/"version": "([^"]+)"/g, (/* m, m1 */) => {
      return `"version": "${babelVersion}"`;
    });
  if (!settings.doNotMigrateBabelDeps) {
    updatedPackageJson = updatedPackageJson
      .replace(/@babel\//g, "@gerhobbelt/babel-")
      .replace(/"(@gerhobbelt\/babel-.*?)": "([^~]?[0-9.a-z-]+)"/g, (
        m,
        m1 /*, m2 */
      ) => {
        return `"${m1}": "${babelVersion}"`;
      });
  }

  const data = JSON.parse(updatedPackageJson);

  // peerDependencies patches:
  if (
    data.peerDependencies &&
    data.peerDependencies["@gerhobbelt/babel-core"]
  ) {
    data.peerDependencies["@gerhobbelt/babel-core"] = babelPeerDependencyClause;
  }

  updatedPackageJson = JSON.stringify(data, null, 2);

  // write
  writeFileSync(filePath, updatedPackageJson);

  console.log("OK", filePath);
}

packages
  .filter(x => x !== "README.md") // ignore root readme
  .forEach(id => {
    const packageJsonPath = join("packages", id, "package.json");

    patchPackageJson(packageJsonPath);
  });

codemods
  .filter(x => x !== "README.md") // ignore root readme
  .forEach(id => {
    const packageJsonPath = join("codemods", id, "package.json");

    patchPackageJson(packageJsonPath);
  });

// do NOT update the base package.json to the (**not yet existing**!) babel npm subpackages' version:
if (false) {
  ["./"].forEach(id => {
    const packageJsonPath = join(id, "package.json");

    patchPackageJson(packageJsonPath, {
      doNotMigrateBabelDeps: true,
    });
  });
}
