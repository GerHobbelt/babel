import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import transformFlowStripTypes from "@gerhobbelt/babel-plugin-transform-flow-strip-types";

export default declare((api, { all }) => {
  api.assertVersion(7);

  return {
    plugins: [[transformFlowStripTypes, { all }]],
  };
});
