import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import helper from "@gerhobbelt/babel-helper-builder-react-jsx";
import { types as t } from "@gerhobbelt/babel-core";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-react-jsx-compat",

    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("jsx");
    },

    visitor: helper({
      pre(state) {
        state.callee = state.tagExpr;
      },

      post(state) {
        if (t.react.isCompatTag(state.tagName)) {
          state.call = t.callExpression(
            t.memberExpression(
              t.memberExpression(t.identifier("React"), t.identifier("DOM")),
              state.tagExpr,
              t.isLiteral(state.tagExpr),
            ),
            state.args,
          );
        }
      },
      compat: true,
    }),
  };
});
