import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import transformExponentiationOperator from "@gerhobbelt/babel-plugin-transform-exponentiation-operator";

export default declare(api => {
  api.assertVersion(7);

  return {
    plugins: [transformExponentiationOperator],
  };
});
