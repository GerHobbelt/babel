import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import syntaxDoExpressions from "@gerhobbelt/babel-plugin-syntax-do-expressions";

export default declare(api => {
  api.assertVersion(7);

  return {
    inherits: syntaxDoExpressions,

    visitor: {
      DoExpression: {
        exit(path) {
          const body = path.node.body.body;
          if (body.length) {
            path.replaceExpressionWithStatements(body);
          } else {
            path.replaceWith(path.scope.buildUndefinedNode());
          }
        },
      },
    },
  };
});
