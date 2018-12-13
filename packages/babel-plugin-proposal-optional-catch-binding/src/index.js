import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import syntaxOptionalCatchBinding from "@gerhobbelt/babel-plugin-syntax-optional-catch-binding";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "proposal-optional-catch-binding",
    inherits: syntaxOptionalCatchBinding,

    visitor: {
      CatchClause(path) {
        if (!path.node.param) {
          const uid = path.scope.generateUidIdentifier("unused");
          const paramPath = path.get("param");
          paramPath.replaceWith(uid);
        }
      },
    },
  };
});
