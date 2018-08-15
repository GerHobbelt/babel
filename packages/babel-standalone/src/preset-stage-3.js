import syntaxDynamicImport from "@gerhobbelt/babel-plugin-syntax-dynamic-import";
import syntaxImportMeta from "@gerhobbelt/babel-plugin-syntax-import-meta";
import transformClassProperties from "@gerhobbelt/babel-plugin-proposal-class-properties";
import transformJsonStrings from "@gerhobbelt/babel-plugin-proposal-json-strings";

export default (_, opts) => {
  let loose = false;

  if (opts !== undefined) {
    if (opts.loose !== undefined) loose = opts.loose;
  }

  return {
    plugins: [
      syntaxDynamicImport,
      syntaxImportMeta,
      [transformClassProperties, { loose }],
      transformJsonStrings,
    ],
  };
};
