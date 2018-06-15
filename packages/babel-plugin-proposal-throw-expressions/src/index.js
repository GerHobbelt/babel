import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import syntaxThrowExpressions from "@gerhobbelt/babel-plugin-syntax-throw-expressions";
import { types as t } from "@gerhobbelt/babel-core";

export default declare(api => {
  api.assertVersion(7);

  return {
    inherits: syntaxThrowExpressions,

    visitor: {
      UnaryExpression(path) {
        const { operator, argument } = path.node;
        if (operator !== "throw") return;

        const arrow = t.functionExpression(
          null,
          [t.identifier("e")],
          t.blockStatement([t.throwStatement(t.identifier("e"))]),
        );

        path.replaceWith(t.callExpression(arrow, [argument]));
      },
    },
  };
});
