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
  return s
    .replace(/\\\\?/g, "/")
    .replace(/(?:\b\w+:)?\/fake\/path\//g, "/fake/path/")
    .replace(/(?:\b\w+:)?\/[/\w]+?\/babel\//g, "/XXXXXX/babel/");
}

expect(filterExceptionStackTrace(actual)).toBe(filterExceptionStackTrace(expected));
