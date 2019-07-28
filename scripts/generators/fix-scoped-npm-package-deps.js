
const path = require("path");
const join = path.join;
const { readFileSync, writeFileSync } = require("fs");

const cwd = process.cwd();

const glob = require("glob");
 
const babelVersion = require(join(cwd, "lerna.json")).version;
console.log("Patching all files to reference @gerhobbelt/babel-* instead of @babel/*");

function patchFile(filePath, settings = {}) {
  const src = readFileSync(filePath, "utf8");
  let patched = 0;

  // apply patches:
  let updatedSrc = src;

  for (;;) {
    // helper variable to cope with multiple @babel/... replacements in a single source line
    let pc = patched;
    
    updatedSrc = updatedSrc
    // inside a string or text:
    .replace(/@babel\/([a-z0-9_-]+)(.*)$/gim, (m, m1, m2) => {
      if (m.includes("@babel/es2015 -> @gerhobbelt/babel-preset-es2015")) {
        return m;
      }
      pc++;
      return `@gerhobbelt/babel-${m1}${m2}`;
    })
    // inside a regex:
    .replace(/^(.*?)@babel\\\/([a-z0-9_-]+)(.*)$/gim, (m, m1, m2, m3) => {
      if (m.includes("@gerhobbelt\\/babel-runtime|@babel\\/runtime|babel-runtime")) {
        return m;
      }
      pc++;
      return `${m1}@gerhobbelt\\/babel-${m2}${m3}`;
    });

    if (pc === patched) {
      break;
    }
    patched = pc;
  }

  // write
  if (patched > 0) {
    writeFileSync(filePath, updatedSrc);

    console.log("+PATCHED OK", filePath);
  } else {
    // console.log("-UNCHANGED", filePath);
  }
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
    "package-lock.json",
    "CHANGELOG.md",
    "fileSet.dump.txt",
    "scripts/generators/fix-scoped-npm-package-deps.js",
  ],
}, function processOneMatch(er, files) {
  // files is an array of filenames.
  if (er) {
    console.error("glob error:", er);
    throw er;
  }

  if (0) {
    console.info("dumping the file set...");
    writeFileSync("fileSet.dump.txt", JSON.stringify(files, null, 2));
  }
  
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
