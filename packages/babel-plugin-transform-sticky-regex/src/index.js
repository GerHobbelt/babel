import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import * as regex from "@gerhobbelt/babel-helper-regex";
import { types as t } from "@gerhobbelt/babel-core";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-sticky-regex",

    visitor: {
      RegExpLiteral(path) {
        const { node } = path;
        if (!regex.is(node, "y")) return;

        path.replaceWith(
          t.newExpression(t.identifier("RegExp"), [
            t.stringLiteral(node.pattern),
            t.stringLiteral(node.flags),
          ]),
        );
      },
    },
  };
});
