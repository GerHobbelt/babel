import { declare } from "@gerhobbelt/babel-helper-plugin-utils";

export default declare(api => {
  api.assertVersion(7);

  return {
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("nullishCoalescingOperator");
    },
  };
});
