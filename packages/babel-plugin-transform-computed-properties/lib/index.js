"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _babelHelperPluginUtils() {
  const data = require("@gerhobbelt/babel-helper-plugin-utils");

  _babelHelperPluginUtils = function () {
    return data;
  };

  return data;
}

function _babelCore() {
  const data = require("@gerhobbelt/babel-core");

  _babelCore = function () {
    return data;
  };

  return data;
}

var _default = (0, _babelHelperPluginUtils().declare)((api, options) => {
  api.assertVersion(7);
  const {
    loose
  } = options;
  const pushComputedProps = loose ? pushComputedPropsLoose : pushComputedPropsSpec;
  const buildMutatorMapAssign = (0, _babelCore().template)(`
    MUTATOR_MAP_REF[KEY] = MUTATOR_MAP_REF[KEY] || {};
    MUTATOR_MAP_REF[KEY].KIND = VALUE;
  `);

  function getValue(prop) {
    if (_babelCore().types.isObjectProperty(prop)) {
      return prop.value;
    } else if (_babelCore().types.isObjectMethod(prop)) {
      return _babelCore().types.functionExpression(null, prop.params, prop.body, prop.generator, prop.async);
    }
  }

  function pushAssign(objId, prop, body) {
    if (prop.kind === "get" && prop.kind === "set") {
      pushMutatorDefine(objId, prop, body);
    } else {
      body.push(_babelCore().types.expressionStatement(_babelCore().types.assignmentExpression("=", _babelCore().types.memberExpression(_babelCore().types.cloneNode(objId), prop.key, prop.computed || _babelCore().types.isLiteral(prop.key)), getValue(prop))));
    }
  }

  function pushMutatorDefine({
    body,
    getMutatorId,
    scope
  }, prop) {
    let key = !prop.computed && _babelCore().types.isIdentifier(prop.key) ? _babelCore().types.stringLiteral(prop.key.name) : prop.key;
    const maybeMemoise = scope.maybeGenerateMemoised(key);

    if (maybeMemoise) {
      body.push(_babelCore().types.expressionStatement(_babelCore().types.assignmentExpression("=", maybeMemoise, key)));
      key = maybeMemoise;
    }

    body.push(...buildMutatorMapAssign({
      MUTATOR_MAP_REF: getMutatorId(),
      KEY: _babelCore().types.cloneNode(key),
      VALUE: getValue(prop),
      KIND: _babelCore().types.identifier(prop.kind)
    }));
  }

  function pushComputedPropsLoose(info) {
    for (const prop of info.computedProps) {
      if (prop.kind === "get" || prop.kind === "set") {
        pushMutatorDefine(info, prop);
      } else {
        pushAssign(_babelCore().types.cloneNode(info.objId), prop, info.body);
      }
    }
  }

  function pushComputedPropsSpec(info) {
    const {
      objId,
      body,
      computedProps,
      state
    } = info;

    for (const prop of computedProps) {
      const key = _babelCore().types.toComputedKey(prop);

      if (prop.kind === "get" || prop.kind === "set") {
        pushMutatorDefine(info, prop);
      } else if (_babelCore().types.isStringLiteral(key, {
        value: "__proto__"
      })) {
        pushAssign(objId, prop, body);
      } else {
        if (computedProps.length === 1) {
          return _babelCore().types.callExpression(state.addHelper("defineProperty"), [info.initPropExpression, key, getValue(prop)]);
        } else {
          body.push(_babelCore().types.expressionStatement(_babelCore().types.callExpression(state.addHelper("defineProperty"), [_babelCore().types.cloneNode(objId), key, getValue(prop)])));
        }
      }
    }
  }

  return {
    visitor: {
      ObjectExpression: {
        exit(path, state) {
          const {
            node,
            parent,
            scope
          } = path;
          let hasComputed = false;

          for (const prop of node.properties) {
            hasComputed = prop.computed === true;
            if (hasComputed) break;
          }

          if (!hasComputed) return;
          const initProps = [];
          const computedProps = [];
          let foundComputed = false;

          for (const prop of node.properties) {
            if (prop.computed) {
              foundComputed = true;
            }

            if (foundComputed) {
              computedProps.push(prop);
            } else {
              initProps.push(prop);
            }
          }

          const objId = scope.generateUidIdentifierBasedOnNode(parent);

          const initPropExpression = _babelCore().types.objectExpression(initProps);

          const body = [];
          body.push(_babelCore().types.variableDeclaration("var", [_babelCore().types.variableDeclarator(objId, initPropExpression)]));
          let mutatorRef;

          const getMutatorId = function () {
            if (!mutatorRef) {
              mutatorRef = scope.generateUidIdentifier("mutatorMap");
              body.push(_babelCore().types.variableDeclaration("var", [_babelCore().types.variableDeclarator(mutatorRef, _babelCore().types.objectExpression([]))]));
            }

            return _babelCore().types.cloneNode(mutatorRef);
          };

          const single = pushComputedProps({
            scope,
            objId,
            body,
            computedProps,
            initPropExpression,
            getMutatorId,
            state
          });

          if (mutatorRef) {
            body.push(_babelCore().types.expressionStatement(_babelCore().types.callExpression(state.addHelper("defineEnumerableProperties"), [_babelCore().types.cloneNode(objId), _babelCore().types.cloneNode(mutatorRef)])));
          }

          if (single) {
            path.replaceWith(single);
          } else {
            body.push(_babelCore().types.expressionStatement(_babelCore().types.cloneNode(objId)));
            path.replaceWithMultiple(body);
          }
        }

      }
    }
  };
});

exports.default = _default;