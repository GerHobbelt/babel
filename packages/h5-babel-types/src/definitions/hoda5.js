import defineType, { assertNodeType } from "./index";

defineType("H5Icon", {
  visitor: ["name"],
  aliases: ["Declaration","Statement"],
  fields: {
    name: {
      validate: assertNodeType("Identifier")
    }
  }
});