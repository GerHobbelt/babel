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

const babelVersion = require(join(cwd, "packages/babel-core/package.json")).version;
console.log("Updating version of all babel packages to", babelVersion);

function patchPackageJson(filePath) {
  const packageJson = readFileSync(filePath, "utf8");

  // apply patches:
  const updatedPackageJson = packageJson
  .replace(/@babel\//g, "@gerhobbelt/babel-")
  .replace(/"(@gerhobbelt\/babel-.*?)": "([0-9.a-z-]+)"/g, (m, m1, m2) => {
    return `"${m1}": "${babelVersion}"`;
  })
  .replace(/"(@gerhobbelt\/babel-.*?)": ">([=0-9.a-z-]+) <([=0-9.a-z-]+)"/g, (m, m1, m2, m3) => {
    return `"${m1}": ">${m2} <${m3}"`;
  })
  .replace(/"version": "([^"]+)"/g, (m, m1) => {
    return `"version": "${babelVersion}"`;
  });

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

["./"]
  .forEach(id => {
    const packageJsonPath = join(id, "package.json");

    patchPackageJson(packageJsonPath);
  });
