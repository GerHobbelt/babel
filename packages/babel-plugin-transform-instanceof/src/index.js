import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import { types as t } from "@gerhobbelt/babel-core";

export default declare(api => {
  api.assertVersion(7);

  return {
    visitor: {
      BinaryExpression(path) {
        const { node } = path;
        if (node.operator === "instanceof") {
          const helper = this.addHelper("instanceof");
          const isUnderHelper = path.findParent(path => {
            return (
              (path.isVariableDeclarator() && path.node.id === helper) ||
              (path.isFunctionDeclaration() &&
                path.node.id &&
                path.node.id.name === helper.name)
            );
          });

          if (isUnderHelper) {
            return;
          } else {
            path.replaceWith(t.callExpression(helper, [node.left, node.right]));
          }
        }
      },
    },
  };
});
