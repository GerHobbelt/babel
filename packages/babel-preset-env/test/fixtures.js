import runner from "@gerhobbelt/babel-helper-plugin-test-runner";

process.env.BABEL_ENV = "env-from-preset";

runner(__dirname);
