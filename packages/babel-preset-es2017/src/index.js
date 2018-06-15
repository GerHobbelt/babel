import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import transformAsyncToGenerator from "@gerhobbelt/babel-plugin-transform-async-to-generator";

export default declare(api => {
  api.assertVersion(7);

  return {
    plugins: [transformAsyncToGenerator],
  };
});
