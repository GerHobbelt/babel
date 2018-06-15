import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import remapAsyncToGenerator from "@gerhobbelt/babel-helper-remap-async-to-generator";
import { addNamed } from "@gerhobbelt/babel-helper-module-imports";
import { types as t } from "@gerhobbelt/babel-core";

export default declare((api, options) => {
  api.assertVersion(7);

  const { method, module } = options;

  if (method && module) {
    return {
      visitor: {
        Function(path, state) {
          if (!path.node.async || path.node.generator) return;

          let wrapAsync = state.methodWrapper;
          if (wrapAsync) {
            wrapAsync = t.cloneNode(wrapAsync);
          } else {
            wrapAsync = state.methodWrapper = addNamed(path, method, module);
          }

          remapAsyncToGenerator(path, { wrapAsync });
        },
      },
    };
  }

  return {
    visitor: {
      Function(path, state) {
        if (!path.node.async || path.node.generator) return;

        remapAsyncToGenerator(path, {
          wrapAsync: state.addHelper("asyncToGenerator"),
        });
      },
    },
  };
});
