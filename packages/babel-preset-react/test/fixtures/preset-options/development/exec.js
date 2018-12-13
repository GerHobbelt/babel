const unify = require("unify-paths").default;
const path = require("path");

// <CWD>
const cwdPathPrefix = path
  .resolve(__dirname, "../../../");

const actual = transform(
  '<Foo bar="baz" />',
  Object.assign({}, opts, { filename: '/fake/path/mock.js' })
).code;

const expected = multiline([
  'var _jsxFileName = "/fake/path/mock.js";',
  'React.createElement(Foo, {',
  '  bar: "baz",',
  '  __source: {',
  '    fileName: _jsxFileName,',
  '    lineNumber: 1',
  '  },',
  '  __self: this',
  '});',
]);

function filterExceptionStackTrace(inp) {
  const s =
    typeof inp === "object"
      ? inp instanceof Error
        ? JSON.stringify(
            {
              message: inp.message,
              stack: inp.stack,
            },
            null,
            2,
          )
        : JSON.stringify(inp, null, 2)
      : "" + inp;
  return unify(s, {
    hasExplicitEscapes: true,
    reducePaths: [
      "fake",
      "babel",
    ],
    cwdPathPrefix: cwdPathPrefix
  });
}

expect(filterExceptionStackTrace(actual)).toBe(filterExceptionStackTrace(expected));
