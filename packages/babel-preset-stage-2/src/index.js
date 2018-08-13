import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import presetStage3 from "@gerhobbelt/babel-preset-stage-3";

import transformDecorators from "@gerhobbelt/babel-plugin-proposal-decorators";
import transformFunctionSent from "@gerhobbelt/babel-plugin-proposal-function-sent";
import transformExportNamespaceFrom from "@gerhobbelt/babel-plugin-proposal-export-namespace-from";
import transformNumericSeparator from "@gerhobbelt/babel-plugin-proposal-numeric-separator";
import transformThrowExpressions from "@gerhobbelt/babel-plugin-proposal-throw-expressions";

export default declare((api, opts = {}) => {
  api.assertVersion(7);

  const { loose = false, useBuiltIns = false, decoratorsLegacy = false } = opts;

  if (typeof loose !== "boolean") {
    throw new Error(
      "@gerhobbelt/babel-preset-stage-2 'loose' option must be a boolean.",
    );
  }
  if (typeof useBuiltIns !== "boolean") {
    throw new Error(
      "@gerhobbelt/babel-preset-stage-2 'useBuiltIns' option must be a boolean.",
    );
  }
  if (typeof decoratorsLegacy !== "boolean") {
    throw new Error(
      "@gerhobbelt/babel-preset-stage-2 'decoratorsLegacy' option must be a boolean.",
    );
  }

  if (decoratorsLegacy !== true) {
    throw new Error(
      "The new decorators proposal is not supported yet." +
        ' You must pass the `"decoratorsLegacy": true` option to' +
        " @gerhobbelt/babel-preset-stage-2",
    );
  }

  return {
    presets: [[presetStage3, { loose, useBuiltIns }]],
    plugins: [
      [transformDecorators, { legacy: decoratorsLegacy }],
      transformFunctionSent,
      transformExportNamespaceFrom,
      transformNumericSeparator,
      transformThrowExpressions,
    ],
  };
});
