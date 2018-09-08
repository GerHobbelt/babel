const unify = require("unify-paths");
const path = require("path");

// <CWD>
const cwdPathPrefix = path
  .resolve(__dirname, "../../../");

var actual = transform(
  'var x = <sometag />',
  Object.assign({}, opts, { filename: '/fake/path/mock.js' })
).code;

var expected = multiline([
  'var _jsxFileName = "/fake/path/mock.js";',
  'var x = <sometag __source={{',
  '  fileName: _jsxFileName,',
  '  lineNumber: 1',
  '}} />;',
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
