// This file is executed by lerna before publishing @gerhobbelt/babel-standalone,
// so that it has the new version and not the old one.

require("child_process").execSync("make prepublish-build-standalone", {
  cwd: require("path").resolve(__dirname, "../../.."),
  stdio: "inherit",
});
