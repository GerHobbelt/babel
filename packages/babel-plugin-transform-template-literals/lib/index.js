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
  let helperName = "taggedTemplateLiteral";
  if (loose) helperName += "Loose";

  function buildConcatCallExressions(items) {
    let avail = true;
    return items.reduce(function (left, right) {
      let canBeInserted = _babelCore().types.isLiteral(right);

      if (!canBeInserted && avail) {
        canBeInserted = true;
        avail = false;
      }

      if (canBeInserted && _babelCore().types.isCallExpression(left)) {
        left.arguments.push(right);
        return left;
      }

      return _babelCore().types.callExpression(_babelCore().types.memberExpression(left, _babelCore().types.identifier("concat")), [right]);
    });
  }

  return {
    name: "transform-template-literals",
    visitor: {
      TaggedTemplateExpression(path) {
        const {
          node
        } = path;
        const {
          quasi
        } = node;
        const strings = [];
        const raws = [];
        let isStringsRawEqual = true;

        for (const elem of quasi.quasis) {
          const {
            raw,
            cooked
          } = elem.value;
          const value = cooked == null ? path.scope.buildUndefinedNode() : _babelCore().types.stringLiteral(cooked);
          strings.push(value);
          raws.push(_babelCore().types.stringLiteral(raw));

          if (raw !== cooked) {
            isStringsRawEqual = false;
          }
        }

        const scope = path.scope.getProgramParent();
        const templateObject = scope.generateUidIdentifier("templateObject");
        const helperId = this.addHelper(helperName);
        const callExpressionInput = [_babelCore().types.arrayExpression(strings)];

        if (!isStringsRawEqual) {
          callExpressionInput.push(_babelCore().types.arrayExpression(raws));
        }

        const lazyLoad = _babelCore().template.ast`
          function ${templateObject}() {
            const data = ${_babelCore().types.callExpression(helperId, callExpressionInput)};
            ${templateObject} = function() { return data };
            return data;
          } 
        `;
        scope.path.unshiftContainer("body", lazyLoad);
        path.replaceWith(_babelCore().types.callExpression(node.tag, [_babelCore().types.callExpression(_babelCore().types.cloneNode(templateObject), []), ...quasi.expressions]));
      },

      TemplateLiteral(path) {
        const nodes = [];
        const expressions = path.get("expressions");
        let index = 0;

        for (const elem of path.node.quasis) {
          if (elem.value.cooked) {
            nodes.push(_babelCore().types.stringLiteral(elem.value.cooked));
          }

          if (index < expressions.length) {
            const expr = expressions[index++];
            const node = expr.node;

            if (!_babelCore().types.isStringLiteral(node, {
              value: ""
            })) {
              nodes.push(node);
            }
          }
        }

        const considerSecondNode = !loose || !_babelCore().types.isStringLiteral(nodes[1]);

        if (!_babelCore().types.isStringLiteral(nodes[0]) && considerSecondNode) {
          nodes.unshift(_babelCore().types.stringLiteral(""));
        }

        let root = nodes[0];

        if (loose) {
          for (let i = 1; i < nodes.length; i++) {
            root = _babelCore().types.binaryExpression("+", root, nodes[i]);
          }
        } else if (nodes.length > 1) {
          root = buildConcatCallExressions(nodes);
        }

        path.replaceWith(root);
      }

    }
  };
});

exports.default = _default;