/* eslint-disable local-rules/plugin-name */

import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import {
  createClassFeaturePlugin,
  FEATURES,
} from "@gerhobbelt/babel-helper-create-class-features-plugin";

export default declare((api, options) => {
  api.assertVersion(7);

  return createClassFeaturePlugin({
    name: "proposal-private-methods",

    feature: FEATURES.privateMethods,
    loose: options.loose,

    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("classPrivateMethods");
    },
  });
});
