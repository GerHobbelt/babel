import { declare } from "@gerhobbelt/babel-helper-plugin-utils";
import ReplaceSupers from "@gerhobbelt/babel-helper-replace-supers";
import { types as t } from "@gerhobbelt/babel-core";

function replacePropertySuper(path, getObjectRef, file) {
  const replaceSupers = new ReplaceSupers({
    getObjectRef: getObjectRef,
    methodPath: path,
    file: file,
  });

  replaceSupers.replace();
}

export default declare(api => {
  api.assertVersion(7);

  return {
    visitor: {
      ObjectExpression(path, state) {
        let objectRef;
        const getObjectRef = () =>
          (objectRef = objectRef || path.scope.generateUidIdentifier("obj"));

        path.get("properties").forEach(propPath => {
          if (!propPath.isMethod()) return;

          replacePropertySuper(propPath, getObjectRef, state);
        });

        if (objectRef) {
          path.scope.push({ id: t.cloneNode(objectRef) });
          path.replaceWith(
            t.assignmentExpression("=", t.cloneNode(objectRef), path.node),
          );
        }
      },
    },
  };
});
