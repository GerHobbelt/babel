"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rewriteModuleStatementsAndPrepareHeader = rewriteModuleStatementsAndPrepareHeader;
exports.ensureStatementsHoisted = ensureStatementsHoisted;
exports.wrapInterop = wrapInterop;
exports.buildNamespaceInitStatements = buildNamespaceInitStatements;
Object.defineProperty(exports, "isModule", {
  enumerable: true,
  get: function () {
    return _babelHelperModuleImports().isModule;
  }
});
Object.defineProperty(exports, "hasExports", {
  enumerable: true,
  get: function () {
    return _normalizeAndLoadMetadata.hasExports;
  }
});
Object.defineProperty(exports, "isSideEffectImport", {
  enumerable: true,
  get: function () {
    return _normalizeAndLoadMetadata.isSideEffectImport;
  }
});

function _assert() {
  const data = _interopRequireDefault(require("assert"));

  _assert = function () {
    return data;
  };

  return data;
}

function t() {
  const data = _interopRequireWildcard(require("@gerhobbelt/babel-types"));

  t = function () {
    return data;
  };

  return data;
}

function _babelTemplate() {
  const data = _interopRequireDefault(require("@gerhobbelt/babel-template"));

  _babelTemplate = function () {
    return data;
  };

  return data;
}

function _chunk() {
  const data = _interopRequireDefault(require("lodash/chunk"));

  _chunk = function () {
    return data;
  };

  return data;
}

function _babelHelperModuleImports() {
  const data = require("@gerhobbelt/babel-helper-module-imports");

  _babelHelperModuleImports = function () {
    return data;
  };

  return data;
}

var _rewriteThis = _interopRequireDefault(require("./rewrite-this"));

var _rewriteLiveReferences = _interopRequireDefault(require("./rewrite-live-references"));

var _normalizeAndLoadMetadata = _interopRequireWildcard(require("./normalize-and-load-metadata"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rewriteModuleStatementsAndPrepareHeader(path, {
  exportName,
  strict,
  allowTopLevelThis,
  strictMode,
  loose,
  noInterop,
  lazy,
  throwOnUninitializedRead,
  esNamespaceOnly
}) {
  (0, _assert().default)((0, _babelHelperModuleImports().isModule)(path), "Cannot process module statements in a script");
  path.node.sourceType = "script";
  const meta = (0, _normalizeAndLoadMetadata.default)(path, exportName, {
    noInterop,
    loose,
    lazy,
    esNamespaceOnly
  });

  if (!allowTopLevelThis) {
    (0, _rewriteThis.default)(path);
  }

  (0, _rewriteLiveReferences.default)(path, meta);

  if (strictMode !== false) {
    const hasStrict = path.node.directives.some(directive => {
      return directive.value.value === "use strict";
    });

    if (!hasStrict) {
      path.unshiftContainer("directives", t().directive(t().directiveLiteral("use strict")));
    }
  }

  const headers = [];

  if ((0, _normalizeAndLoadMetadata.hasExports)(meta) && !strict) {
    headers.push(buildESModuleHeader(meta, loose));
  }

  const nameList = buildExportNameListDeclaration(path, meta);

  if (nameList) {
    meta.exportNameListName = nameList.name;
    headers.push(nameList.statement);
  }

  headers.push(...buildExportInitializationStatements(path, meta, loose, throwOnUninitializedRead));
  return {
    meta,
    headers
  };
}

function ensureStatementsHoisted(statements) {
  statements.forEach(header => {
    header._blockHoist = 3;
  });
}

function wrapInterop(programPath, expr, type) {
  if (type === "none") {
    return null;
  }

  let helper;

  if (type === "default") {
    helper = "interopRequireDefault";
  } else if (type === "namespace") {
    helper = "interopRequireWildcard";
  } else {
    throw new Error(`Unknown interop: ${type}`);
  }

  return t().callExpression(programPath.hub.file.addHelper(helper), [expr]);
}

function buildNamespaceInitStatements(metadata, sourceMetadata, loose = false) {
  const statements = [];
  let srcNamespace = t().identifier(sourceMetadata.name);
  if (sourceMetadata.lazy) srcNamespace = t().callExpression(srcNamespace, []);

  for (const localName of sourceMetadata.importsNamespace) {
    if (localName === sourceMetadata.name) continue;
    statements.push(_babelTemplate().default.statement`var NAME = SOURCE;`({
      NAME: localName,
      SOURCE: t().cloneNode(srcNamespace)
    }));
  }

  if (loose) {
    statements.push(...buildReexportsFromMeta(metadata, sourceMetadata, loose));
  }

  for (const exportName of sourceMetadata.reexportNamespace) {
    statements.push((sourceMetadata.lazy ? _babelTemplate().default.statement`
            Object.defineProperty(EXPORTS, "NAME", {
              enumerable: true,
              get: function() {
                return NAMESPACE;
              }
            });
          ` : _babelTemplate().default.statement`EXPORTS.NAME = NAMESPACE;`)({
      EXPORTS: metadata.exportName,
      NAME: exportName,
      NAMESPACE: t().cloneNode(srcNamespace)
    }));
  }

  if (sourceMetadata.reexportAll) {
    const statement = buildNamespaceReexport(metadata, t().cloneNode(srcNamespace), loose);
    statement.loc = sourceMetadata.reexportAll.loc;
    statements.push(statement);
  }

  return statements;
}

const getTemplateForReexport = loose => {
  return loose ? _babelTemplate().default.statement`EXPORTS.EXPORT_NAME = NAMESPACE.IMPORT_NAME;` : _babelTemplate().default`
      Object.defineProperty(EXPORTS, "EXPORT_NAME", {
        enumerable: true,
        get: function() {
          return NAMESPACE.IMPORT_NAME;
        },
      });
    `;
};

const buildReexportsFromMeta = (meta, metadata, loose) => {
  const namespace = metadata.lazy ? t().callExpression(t().identifier(metadata.name), []) : t().identifier(metadata.name);
  const templateForCurrentMode = getTemplateForReexport(loose);
  return Array.from(metadata.reexports, ([exportName, importName]) => templateForCurrentMode({
    EXPORTS: meta.exportName,
    EXPORT_NAME: exportName,
    NAMESPACE: t().cloneNode(namespace),
    IMPORT_NAME: importName
  }));
};

function buildESModuleHeader(metadata, enumerable = false) {
  return (enumerable ? _babelTemplate().default.statement`
        EXPORTS.__esModule = true;
      ` : _babelTemplate().default.statement`
        Object.defineProperty(EXPORTS, "__esModule", {
          value: true,
        });
      `)({
    EXPORTS: metadata.exportName
  });
}

function buildNamespaceReexport(metadata, namespace, loose) {
  return (loose ? _babelTemplate().default.statement`
        Object.keys(NAMESPACE).forEach(function(key) {
          if (key === "default" || key === "__esModule") return;
          VERIFY_NAME_LIST;

          EXPORTS[key] = NAMESPACE[key];
        });
      ` : _babelTemplate().default.statement`
        Object.keys(NAMESPACE).forEach(function(key) {
          if (key === "default" || key === "__esModule") return;
          VERIFY_NAME_LIST;

          Object.defineProperty(EXPORTS, key, {
            enumerable: true,
            get: function() {
              return NAMESPACE[key];
            },
          });
        });
    `)({
    NAMESPACE: namespace,
    EXPORTS: metadata.exportName,
    VERIFY_NAME_LIST: metadata.exportNameListName ? _babelTemplate().default`
            if (Object.prototype.hasOwnProperty.call(EXPORTS_LIST, key)) return;
          `({
      EXPORTS_LIST: metadata.exportNameListName
    }) : null
  });
}

function buildExportNameListDeclaration(programPath, metadata) {
  const exportedVars = Object.create(null);

  for (const data of metadata.local.values()) {
    for (const name of data.names) {
      exportedVars[name] = true;
    }
  }

  let hasReexport = false;

  for (const data of metadata.source.values()) {
    for (const exportName of data.reexports.keys()) {
      exportedVars[exportName] = true;
    }

    for (const exportName of data.reexportNamespace) {
      exportedVars[exportName] = true;
    }

    hasReexport = hasReexport || data.reexportAll;
  }

  if (!hasReexport || Object.keys(exportedVars).length === 0) return null;
  const name = programPath.scope.generateUidIdentifier("exportNames");
  delete exportedVars.default;
  return {
    name: name.name,
    statement: t().variableDeclaration("var", [t().variableDeclarator(name, t().valueToNode(exportedVars))])
  };
}

function buildExportInitializationStatements(programPath, metadata, loose = false, throwOnUninitializedRead = false) {
  const initStatements = [];
  const exportNames = [];

  for (const [localName, data] of metadata.local) {
    if (data.kind === "import") {} else if (data.kind === "hoisted") {
      initStatements.push(buildInitStatement(metadata, data.names, t().identifier(localName)));
    } else {
      exportNames.push(...data.names);
    }
  }

  for (const data of metadata.source.values()) {
    if (!loose) {
      initStatements.push(...buildReexportsFromMeta(metadata, data, loose));
    }

    for (const exportName of data.reexportNamespace) {
      exportNames.push(exportName);
    }
  }

  if (throwOnUninitializedRead) {
    const setterParam = programPath.scope.generateUidIdentifier("v");

    for (const exportName of exportNames) {
      initStatements.push(...buildThrowInitStatements(metadata, exportName, setterParam, programPath.scope));
    }
  } else {
    initStatements.push(...(0, _chunk().default)(exportNames, 100).map(members => {
      return buildInitStatement(metadata, members, programPath.scope.buildUndefinedNode());
    }));
  }

  return initStatements;
}

function buildThrowInitStatements(metadata, exportName, setterParam, scope) {
  const storage = scope.generateUidIdentifier(exportName + "_storage");
  const set = scope.generateUidIdentifier(exportName + "_set");
  return _babelTemplate().default.statements`
    var STORAGE, SET = false;
    Object.defineProperty(EXPORTS, NAME, {
      get: function(){
        if (SET === false) {
          throw new Error(GET_ERROR);
        }
        return STORAGE;
      },
      set: function(SETTER_PARAM){
        if (SET) {
          throw new Error(SET_ERROR);
        }
        SET = true;
        STORAGE = SETTER_PARAM;
      },
      enumerable: true,
    });
  `({
    STORAGE: storage,
    SET: set,
    SETTER_PARAM: setterParam,
    EXPORTS: metadata.exportName,
    NAME: t().stringLiteral(exportName),
    GET_ERROR: t().stringLiteral(`Cannot access uninitialized export ${exportName}`),
    SET_ERROR: t().stringLiteral(`Cannot reassign exported value ${exportName}`)
  });
}

function buildInitStatement(metadata, exportNames, initExpr) {
  return t().expressionStatement(exportNames.reduce((acc, exportName) => _babelTemplate().default.expression`EXPORTS.NAME = VALUE`({
    EXPORTS: metadata.exportName,
    NAME: exportName,
    VALUE: acc
  }), initExpr));
}