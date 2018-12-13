import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import { types as t } from "@gerhobbelt/babel-core";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-reserved-words",

    visitor: {
      "BindingIdentifier|ReferencedIdentifier"(path) {
        if (!t.isValidES3Identifier(path.node.name)) {
          path.scope.rename(path.node.name);
        }
      },
    },
  };
});
