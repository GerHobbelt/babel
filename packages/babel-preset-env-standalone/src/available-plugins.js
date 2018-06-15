import { availablePlugins, registerPlugin } from "@gerhobbelt/babel-standalone";

const notIncludedPlugins = {
  "transform-new-target": require("@gerhobbelt/babel-plugin-transform-new-target"),
};

Object.keys(notIncludedPlugins).forEach(pluginName => {
  if (!availablePlugins[pluginName]) {
    registerPlugin(pluginName, notIncludedPlugins[pluginName]);
  }
});

export default availablePlugins;
