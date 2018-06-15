import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import presetStage1 from "@gerhobbelt/babel-preset-stage-1";

import transformFunctionBind from "@gerhobbelt/babel-plugin-proposal-function-bind";

export default declare((api, opts = {}) => {
  api.assertVersion(7);

  const { loose = false, useBuiltIns = false, decoratorsLegacy = false } = opts;

  if (typeof loose !== "boolean") {
    throw new Error("@gerhobbelt/babel-preset-stage-0 'loose' option must be a boolean.");
  }
  if (typeof useBuiltIns !== "boolean") {
    throw new Error(
      "@gerhobbelt/babel-preset-stage-0 'useBuiltIns' option must be a boolean.",
    );
  }
  if (typeof decoratorsLegacy !== "boolean") {
    throw new Error(
      "@gerhobbelt/babel-preset-stage-0 'decoratorsLegacy' option must be a boolean.",
    );
  }

  if (decoratorsLegacy !== true) {
    throw new Error(
      "The new decorators proposal is not supported yet." +
        ' You must pass the `"decoratorsLegacy": true` option to' +
        " @gerhobbelt/babel-preset-stage-0",
    );
  }

  return {
    presets: [[presetStage1, { loose, useBuiltIns, decoratorsLegacy }]],
    plugins: [transformFunctionBind],
  };
});
