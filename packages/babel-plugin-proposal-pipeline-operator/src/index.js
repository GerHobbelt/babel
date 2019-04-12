import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import syntaxPipelineOperator from "@gerhobbelt/babel-plugin-syntax-pipeline-operator";
import minimalVisitor from "./minimalVisitor";
import smartVisitor from "./smartVisitor";

const visitorsPerProposal = {
  minimal: minimalVisitor,
  smart: smartVisitor,
};

export default declare((api, options) => {
  api.assertVersion(7);

  return {
    name: "proposal-pipeline-operator",
    inherits: syntaxPipelineOperator,
    visitor: visitorsPerProposal[options.proposal],
  };
});
