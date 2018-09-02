"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runCodeInTestContext = runCodeInTestContext;
exports.default = _default;

function babel() {
  const data = _interopRequireWildcard(require("@gerhobbelt/babel-core"));

  babel = function () {
    return data;
  };

  return data;
}

function _babelHelperFixtures() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-helper-fixtures"));

  _babelHelperFixtures = function () {
    return data;
  };

  return data;
}

function _sourceMap() {
  const data = _interopRequireDefault(require("source-map"));

  _sourceMap = function () {
    return data;
  };

  return data;
}

function _babelCodeFrame() {
  const data = require("@gerhobbelt/babel-code-frame");

  _babelCodeFrame = function () {
    return data;
  };

  return data;
}

function _defaults() {
  const data = _interopRequireDefault(require("lodash/defaults"));

  _defaults = function () {
    return data;
  };

  return data;
}

function _includes() {
  const data = _interopRequireDefault(require("lodash/includes"));

  _includes = function () {
    return data;
  };

  return data;
}

function _escapeRegExp() {
  const data = _interopRequireDefault(require("lodash/escapeRegExp"));

  _escapeRegExp = function () {
    return data;
  };

  return data;
}

var helpers = _interopRequireWildcard(require("./helpers"));

function _extend() {
  const data = _interopRequireDefault(require("lodash/extend"));

  _extend = function () {
    return data;
  };

  return data;
}

function _merge() {
  const data = _interopRequireDefault(require("lodash/merge"));

  _merge = function () {
    return data;
  };

  return data;
}

function _resolve() {
  const data = _interopRequireDefault(require("resolve"));

  _resolve = function () {
    return data;
  };

  return data;
}

function _assert() {
  const data = _interopRequireDefault(require("assert"));

  _assert = function () {
    return data;
  };

  return data;
}

function _fs() {
  const data = _interopRequireDefault(require("fs"));

  _fs = function () {
    return data;
  };

  return data;
}

function _path() {
  const data = _interopRequireDefault(require("path"));

  _path = function () {
    return data;
  };

  return data;
}

function _vm() {
  const data = _interopRequireDefault(require("vm"));

  _vm = function () {
    return data;
  };

  return data;
}

function _jestDiff() {
  const data = _interopRequireDefault(require("jest-diff"));

  _jestDiff = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const moduleCache = {};

const testContext = _vm().default.createContext(Object.assign({}, helpers, {
  process: process,
  transform: babel().transform,
  setTimeout: setTimeout,
  setImmediate: setImmediate,
  expect
}));

testContext.global = testContext;
runModuleInTestContext("@gerhobbelt/babel-polyfill", __filename);
runCodeInTestContext((0, babel().buildExternalHelpers)(), {
  filename: _path().default.join(__dirname, "babel-helpers-in-memory.js")
});

function runModuleInTestContext(id, relativeFilename) {
  const filename = _resolve().default.sync(id, {
    basedir: _path().default.dirname(relativeFilename)
  });

  if (filename === id) return require(id);
  if (moduleCache[filename]) return moduleCache[filename].exports;
  const module = moduleCache[filename] = {
    id: filename,
    exports: {}
  };

  const dirname = _path().default.dirname(filename);

  const req = id => runModuleInTestContext(id, filename);

  const src = _fs().default.readFileSync(filename, "utf8");

  const code = `(function (exports, require, module, __filename, __dirname) {${src}\n});`;

  _vm().default.runInContext(code, testContext, {
    filename,
    displayErrors: true
  }).call(module.exports, module.exports, req, module, filename, dirname);

  return module.exports;
}

function runCodeInTestContext(code, opts) {
  const filename = opts.filename;

  const dirname = _path().default.dirname(filename);

  const req = id => runModuleInTestContext(id, filename);

  const module = {
    id: filename,
    exports: {}
  };
  const oldCwd = process.cwd();

  try {
    if (opts.filename) process.chdir(_path().default.dirname(opts.filename));
    const src = `(function(exports, require, module, __filename, __dirname, opts) {${code}\n});`;
    return _vm().default.runInContext(src, testContext, {
      filename,
      displayErrors: true
    })(module.exports, req, module, filename, dirname, opts);
  } finally {
    process.chdir(oldCwd);
  }
}

function wrapPackagesArray(type, names, optionsDir) {
  return (names || []).map(function (val) {
    if (typeof val === "string") val = [val];

    if (val[0][0] === ".") {
      if (!optionsDir) {
        throw new Error("Please provide an options.json in test dir when using a " + "relative plugin path.");
      }

      val[0] = _path().default.resolve(optionsDir, val[0]);
    } else {
      val[0] = __dirname + "/../../babel-" + type + "-" + val[0];
    }

    return val;
  });
}

function checkDuplicatedNodes(ast) {
  const nodes = new WeakSet();
  const parents = new WeakMap();

  const setParent = (child, parent) => {
    if (typeof child === "object" && child !== null) {
      let p = parents.get(child);

      if (!p) {
        p = [];
        parents.set(child, p);
      }

      p.unshift(parent);
    }
  };

  const registerChildren = node => {
    for (const key in node) {
      if (Array.isArray(node[key])) {
        node[key].forEach(child => setParent(child, node));
      } else {
        setParent(node[key], node);
      }
    }
  };

  const hidePrivateProperties = (key, val) => {
    if (key[0] === "_") return "[Private]";
    return val;
  };

  babel().types.traverseFast(ast, node => {
    registerChildren(node);

    if (nodes.has(node)) {
      throw new Error("Do not reuse nodes. Use `t.cloneNode` to copy them.\n" + JSON.stringify(node, hidePrivateProperties, 2) + "\nParent:\n" + JSON.stringify(parents.get(node), hidePrivateProperties, 2));
    }

    nodes.add(node);
  });
}

function run(task) {
  const actual = task.actual;
  const expected = task.expect;
  const exec = task.exec;
  const opts = task.options;
  const optionsDir = task.optionsDir;

  function filterExceptionStackTrace(s) {
    return s.replace(/[\\/]/g, "/").replace(/\b(?:\w+:)?\/[/\w]+?\/babel\/packages\//g, "/XXXXXX/babel/packages/");
  }

  function getOpts(self) {
    const newOpts = (0, _merge().default)({
      cwd: _path().default.dirname(self.loc),
      filename: self.loc,
      filenameRelative: self.filename,
      sourceFileName: self.filename,
      sourceType: "script",
      babelrc: false,
      inputSourceMap: task.inputSourceMap || undefined
    }, opts);
    newOpts.plugins = wrapPackagesArray("plugin", newOpts.plugins, optionsDir);
    newOpts.presets = wrapPackagesArray("preset", newOpts.presets, optionsDir).map(function (val) {
      if (val.length > 3) {
        throw new Error("Unexpected extra options " + JSON.stringify(val.slice(3)) + " passed to preset.");
      }

      return val;
    });
    return newOpts;
  }

  let execCode = exec.code;
  let result;
  let resultExec;

  if (execCode) {
    const execOpts = getOpts(exec);
    result = babel().transform(execCode, execOpts);
    checkDuplicatedNodes(result.ast);
    execCode = result.code;

    try {
      resultExec = runCodeInTestContext(execCode, execOpts);
    } catch (err) {
      err.message = `${exec.loc}: ${err.message}\n` + (0, _babelCodeFrame().codeFrameColumns)(execCode, {});
      throw err;
    }
  }

  let actualCode = actual.code;
  const expectCode = expected.code;

  if (!execCode || actualCode) {
    result = babel().transform(actualCode, getOpts(actual));
    const expectedCode = result.code.replace((0, _escapeRegExp().default)(_path().default.resolve(__dirname, "../../../").replace(/[\\]/g, "/")), "<CWD>");
    checkDuplicatedNodes(result.ast);

    if (!expected.code && expectedCode && !opts.throws && _fs().default.statSync(_path().default.dirname(expected.loc)).isDirectory() && !process.env.CI) {
      const expectedFile = expected.loc.replace(/\.m?js$/, result.sourceType === "module" ? ".mjs" : ".js");
      console.log(`New test file created: ${expectedFile}`);

      _fs().default.writeFileSync(expectedFile, `${expectedCode}\n`);

      if (expected.loc !== expectedFile) {
        try {
          _fs().default.unlinkSync(expected.loc);
        } catch (e) {}
      }
    } else {
      actualCode = expectedCode.trim();

      try {
        expect(filterExceptionStackTrace(actualCode)).toEqualFile({
          filename: expected.loc,
          code: filterExceptionStackTrace(expectCode)
        });
      } catch (e) {
        if (!process.env.OVERWRITE) throw e;
        console.log(`Updated test file: ${expected.loc}`);

        _fs().default.writeFileSync(expected.loc, `${expectedCode}\n`);
      }

      if (actualCode) {
        expect(expected.loc).toMatch(result.sourceType === "module" ? /\.mjs$/ : /\.js$/);
      }
    }
  }

  if (task.sourceMap) {
    expect(result.map).toEqual(task.sourceMap);
  }

  if (task.sourceMappings) {
    const consumer = new (_sourceMap().default.SourceMapConsumer)(result.map);
    task.sourceMappings.forEach(function (mapping) {
      const actual = mapping.original;
      const expected = consumer.originalPositionFor(mapping.generated);
      expect({
        line: expected.line,
        column: expected.column
      }).toEqual(actual);
    });
  }

  if (execCode && resultExec) {
    return resultExec;
  }
}

const toEqualFile = () => ({
  compare: (actual, {
    filename,
    code
  }) => {
    const pass = actual === code;
    return {
      pass,
      message: () => {
        const diffString = (0, _jestDiff().default)(code, actual, {
          expand: false
        });
        return `Expected ${filename} to match transform output.\n` + `To autogenerate a passing version of this file, delete the file and re-run the tests.\n\n` + `Diff:\n\n${diffString}`;
      }
    };
  },
  negativeCompare: () => {
    throw new Error("Negation unsupported");
  }
});

function _default(fixturesLoc, name, suiteOpts = {}, taskOpts = {}, dynamicOpts) {
  const suites = (0, _babelHelperFixtures().default)(fixturesLoc);

  for (const testSuite of suites) {
    if ((0, _includes().default)(suiteOpts.ignoreSuites, testSuite.title)) continue;
    describe(name + "/" + testSuite.title, function () {
      jest.addMatchers({
        toEqualFile
      });

      for (const task of testSuite.tests) {
        if ((0, _includes().default)(suiteOpts.ignoreTasks, task.title) || (0, _includes().default)(suiteOpts.ignoreTasks, testSuite.title + "/" + task.title)) {
          continue;
        }

        const testFn = task.disabled ? it.skip : it;
        testFn(task.title, function () {
          function runTask() {
            run(task);
          }

          (0, _defaults().default)(task.options, {
            sourceMap: !!(task.sourceMappings || task.sourceMap)
          });
          (0, _extend().default)(task.options, taskOpts);
          if (dynamicOpts) dynamicOpts(task.options, task);
          const throwMsg = task.options.throws;

          if (throwMsg) {
            delete task.options.throws;

            _assert().default.throws(runTask, function (err) {
              return throwMsg === true || err.message.indexOf(throwMsg) >= 0;
            });
          } else {
            if (task.exec.code) {
              const result = run(task);

              if (result && typeof result.then === "function") {
                return result;
              }
            } else {
              runTask();
            }
          }
        });
      }
    });
  }
}