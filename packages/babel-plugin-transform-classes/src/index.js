// @flow
import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import annotateAsPure from "@gerhobbelt/babel-helper-annotate-as-pure";
import nameFunction from "@gerhobbelt/babel-helper-function-name";
import splitExportDeclaration from "@gerhobbelt/babel-helper-split-export-declaration";
import { types as t } from "@gerhobbelt/babel-core";
import type { NodePath } from "@gerhobbelt/babel-traverse";
import globals from "globals";
import transformClass from "./transformClass";

const getBuiltinClasses = category =>
  Object.keys(globals[category]).filter(name => /^[A-Z]/.test(name));

const builtinClasses = new Set([
  ...getBuiltinClasses("builtin"),
  ...getBuiltinClasses("browser"),
]);

export default declare((api, options) => {
  api.assertVersion(7);

  const { loose } = options;

  // todo: investigate traversal requeueing
  const VISITED = Symbol();

  return {
    name: "transform-classes",

    visitor: {
      ExportDefaultDeclaration(path: NodePath) {
        if (!path.get("declaration").isClassDeclaration()) return;
        splitExportDeclaration(path);
      },

      ClassDeclaration(path: NodePath) {
        const { node } = path;

        const ref = node.id || path.scope.generateUidIdentifier("class");

        path.replaceWith(
          t.variableDeclaration("let", [
            t.variableDeclarator(ref, t.toExpression(node)),
          ]),
        );
      },

      ClassExpression(path: NodePath, state: any) {
        const { node } = path;
        if (node[VISITED]) return;

        const inferred = nameFunction(path);
        if (inferred && inferred !== node) {
          path.replaceWith(inferred);
          return;
        }

        node[VISITED] = true;

        path.replaceWith(
          transformClass(path, state.file, builtinClasses, loose),
        );

        if (path.isCallExpression()) {
          annotateAsPure(path);
          if (path.get("callee").isArrowFunctionExpression()) {
            path.get("callee").arrowFunctionToExpression();
          }
        }
      },
    },
  };
});
