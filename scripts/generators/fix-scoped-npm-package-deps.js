
const path = require("path");
const join = path.join;
const { readFileSync, writeFileSync } = require("fs");

const cwd = process.cwd();

const glob = require("glob");
 
const babelVersion = require(join(cwd, "lerna.json")).version;
console.log("Patching all files to reference @gerhobbelt/babel-* instead of @babel/*");

function patchFile(filePath, settings = {}) {
  const src = readFileSync(filePath, "utf8");
  let patched = false;

  // apply patches:
  let updatedSrc = src
    .replace(/@babel\/([a-z0-9_-]+)/gi, (m, m1) => {
      patched = true;
      return `@gerhobbelt/babel-${m1}`;
    });

  // write
  if (patched) {
    writeFileSync(filePath, updatedSrc);
  }

  console.log(patched ? "+PATCHED OK" : "-UNCHANGED", filePath);
}

glob("**/*", {
  dot: true,
  nosort: true,
  nodir: true,
  debug: false,
  ignore: [
    "node_modules/**/*",
    "node_modules_backup/**/*",
    "tmp/**/*",
    ".git*",
    ".eslintrc.json",
    "yarn.lock",
    "fileSet.dump.txt",
  ],
}, function processOneMatch(er, files) {
  // files is an array of filenames.
  if (er) {
    console.error("glob error:", er);
    throw er;
  }

  console.info("dumping the file set...");
  writeFileSync("fileSet.dump.txt", JSON.stringify(files, null, 2));

  console.info("processing the file set...");
  files.forEach((id) => {
    patchFile(id);
  });
});

// packages
//   .filter(x => x !== "README.md") // ignore root readme
//   .forEach(id => {
//     const packageJsonPath = join("packages", id, "package.json");
//
//     patchPackageJson(packageJsonPath);
//   });
