import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import { types as t } from "@gerhobbelt/babel-core";

export default declare(api => {
  api.assertVersion(7);

  return {
    visitor: {
      FunctionExpression: {
        exit(path) {
          const { node } = path;
          if (!node.id) return;

          path.replaceWith(
            t.callExpression(
              t.functionExpression(
                null,
                [],
                t.blockStatement([
                  t.toStatement(node),
                  t.returnStatement(t.cloneNode(node.id)),
                ]),
              ),
              [],
            ),
          );
        },
      },
    },
  };
});
