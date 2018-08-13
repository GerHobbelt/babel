import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import syntaxDynamicImport from "@gerhobbelt/babel-plugin-syntax-dynamic-import";
import syntaxImportMeta from "@gerhobbelt/babel-plugin-syntax-import-meta";
import transformAsyncGeneratorFunctions from "@gerhobbelt/babel-plugin-proposal-async-generator-functions";
import transformClassProperties from "@gerhobbelt/babel-plugin-proposal-class-properties";
import transformJsonStrings from "@gerhobbelt/babel-plugin-proposal-json-strings";
import transformObjectRestSpread from "@gerhobbelt/babel-plugin-proposal-object-rest-spread";
import transformOptionalCatchBinding from "@gerhobbelt/babel-plugin-proposal-optional-catch-binding";
import transformUnicodePropertyRegex from "@gerhobbelt/babel-plugin-proposal-unicode-property-regex";

export default declare((api, opts) => {
  api.assertVersion(7);

  let loose = false;
  let useBuiltIns = false;

  if (opts !== undefined) {
    if (opts.loose !== undefined) loose = opts.loose;
    if (opts.useBuiltIns !== undefined) useBuiltIns = opts.useBuiltIns;
  }

  if (typeof loose !== "boolean") {
    throw new Error(
      "@gerhobbelt/babel-preset-stage-3 'loose' option must be a boolean.",
    );
  }
  if (typeof useBuiltIns !== "boolean") {
    throw new Error(
      "@gerhobbelt/babel-preset-stage-3 'useBuiltIns' option must be a boolean.",
    );
  }

  return {
    plugins: [
      syntaxDynamicImport,
      syntaxImportMeta,
      transformAsyncGeneratorFunctions,
      [transformClassProperties, { loose }],
      transformJsonStrings,
      [transformObjectRestSpread, { loose, useBuiltIns }],
      transformOptionalCatchBinding,
      transformUnicodePropertyRegex,
    ],
  };
});
