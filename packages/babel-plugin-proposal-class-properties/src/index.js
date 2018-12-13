import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import pluginClassFeatures, {
  enableFeature,
  FEATURES,
} from "@gerhobbelt/babel-plugin-class-features";

const isNoInitialTypeAnnotationProp = o =>
  o.has("typeAnnotation") && !o.has("value");

export default declare((api, options) => {
  api.assertVersion(7);

  const { loose } = options;

  return {
    name: "proposal-class-properties",

    inherits: pluginClassFeatures,

    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("classProperties", "classPrivateProperties");
    },

    pre() {
      enableFeature(this.file, FEATURES.fields, loose);
    },
  };
});
