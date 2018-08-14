import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import presetStage2 from "@gerhobbelt/babel-preset-stage-2";

import transformExportDefaultFrom from "@gerhobbelt/babel-plugin-proposal-export-default-from";
import transformLogicalAssignmentOperators from "@gerhobbelt/babel-plugin-proposal-logical-assignment-operators";
import transformOptionalChaining from "@gerhobbelt/babel-plugin-proposal-optional-chaining";
import transformPipelineOperator from "@gerhobbelt/babel-plugin-proposal-pipeline-operator";
import transformNullishCoalescingOperator from "@gerhobbelt/babel-plugin-proposal-nullish-coalescing-operator";
import transformDoExpressions from "@gerhobbelt/babel-plugin-proposal-do-expressions";

export default declare((api, opts = {}) => {
  api.assertVersion(7);

  const {
    loose = false,
    useBuiltIns = false,
    decoratorsLegacy = true,
    pipelineProposal = "minimal",
  } = opts;

  if (typeof loose !== "boolean") {
    throw new Error(
      "@gerhobbelt/babel-preset-stage-1 'loose' option must be a boolean.",
    );
  }
  if (typeof useBuiltIns !== "boolean") {
    throw new Error(
      "@gerhobbelt/babel-preset-stage-1 'useBuiltIns' option must be a boolean.",
    );
  }
  if (typeof decoratorsLegacy !== "boolean") {
    throw new Error(
      "@gerhobbelt/babel-preset-stage-1 'decoratorsLegacy' option must be a boolean.",
    );
  }

  return {
    presets: [[presetStage2, { loose, useBuiltIns, decoratorsLegacy }]],
    plugins: [
      transformExportDefaultFrom,
      transformLogicalAssignmentOperators,
      [transformOptionalChaining, { loose }],
      [transformPipelineOperator, { proposal: pipelineProposal }],
      [transformNullishCoalescingOperator, { loose }],
      transformDoExpressions,
    ],
  };
});
