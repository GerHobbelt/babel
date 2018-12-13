import presetStage2 from "./preset-stage-2";

import transformExportDefaultFrom from "@gerhobbelt/babel-plugin-proposal-export-default-from";
import transformLogicalAssignmentOperators from "@gerhobbelt/babel-plugin-proposal-logical-assignment-operators";
import transformOptionalChaining from "@gerhobbelt/babel-plugin-proposal-optional-chaining";
import transformPipelineOperator from "@gerhobbelt/babel-plugin-proposal-pipeline-operator";
import transformNullishCoalescingOperator from "@gerhobbelt/babel-plugin-proposal-nullish-coalescing-operator";
import transformDoExpressions from "@gerhobbelt/babel-plugin-proposal-do-expressions";

export default (_, opts = {}) => {
  const {
    loose = false,
    useBuiltIns = false,
    decoratorsLegacy = false,
    decoratorsBeforeExport,
    pipelineProposal = "minimal",
  } = opts;

  return {
    presets: [
      [
        presetStage2,
        { loose, useBuiltIns, decoratorsLegacy, decoratorsBeforeExport },
      ],
    ],
    plugins: [
      transformExportDefaultFrom,
      transformLogicalAssignmentOperators,
      [transformOptionalChaining, { loose }],
      [transformPipelineOperator, { proposal: pipelineProposal }],
      [transformNullishCoalescingOperator, { loose }],
      transformDoExpressions,
    ],
  };
};
