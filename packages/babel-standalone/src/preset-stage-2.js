import presetStage3 from "./preset-stage-3";

import transformDecorators from "@gerhobbelt/babel-plugin-proposal-decorators";
import transformFunctionSent from "@gerhobbelt/babel-plugin-proposal-function-sent";
import transformExportNamespaceFrom from "@gerhobbelt/babel-plugin-proposal-export-namespace-from";
import transformNumericSeparator from "@gerhobbelt/babel-plugin-proposal-numeric-separator";
import transformThrowExpressions from "@gerhobbelt/babel-plugin-proposal-throw-expressions";

export default (_, opts = {}) => {
  const { loose = false, useBuiltIns = false, decoratorsLegacy = false } = opts;

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
};
