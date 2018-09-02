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

function filterExceptionStackTrace(s) {
  return s.replace(/[\\/]/g, '/').replace(/\b(?:\w+:)?\/fake\/path\//g, '/fake/path/');
}

expect(filterExceptionStackTrace(actual)).toBe(filterExceptionStackTrace(expected));
