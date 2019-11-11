// @flow
/*
 * This file is auto-generated! Do not modify it directly.
 * To re-generate run 'make build'
 */
import externalHelpers from "@gerhobbelt/babel-plugin-external-helpers";
import syntaxAsyncGenerators from "@gerhobbelt/babel-plugin-syntax-async-generators";
import syntaxClassProperties from "@gerhobbelt/babel-plugin-syntax-class-properties";
import syntaxDecorators from "@gerhobbelt/babel-plugin-syntax-decorators";
import syntaxDoExpressions from "@gerhobbelt/babel-plugin-syntax-do-expressions";
import syntaxDynamicImport from "@gerhobbelt/babel-plugin-syntax-dynamic-import";
import syntaxExportDefaultFrom from "@gerhobbelt/babel-plugin-syntax-export-default-from";
import syntaxExportNamespaceFrom from "@gerhobbelt/babel-plugin-syntax-export-namespace-from";
import syntaxFlow from "@gerhobbelt/babel-plugin-syntax-flow";
import syntaxFunctionBind from "@gerhobbelt/babel-plugin-syntax-function-bind";
import syntaxFunctionSent from "@gerhobbelt/babel-plugin-syntax-function-sent";
import syntaxImportMeta from "@gerhobbelt/babel-plugin-syntax-import-meta";
import syntaxJsx from "@gerhobbelt/babel-plugin-syntax-jsx";
import syntaxObjectRestSpread from "@gerhobbelt/babel-plugin-syntax-object-rest-spread";
import syntaxOptionalCatchBinding from "@gerhobbelt/babel-plugin-syntax-optional-catch-binding";
import syntaxPipelineOperator from "@gerhobbelt/babel-plugin-syntax-pipeline-operator";
import syntaxTypescript from "@gerhobbelt/babel-plugin-syntax-typescript";
import proposalAsyncGeneratorFunctions from "@gerhobbelt/babel-plugin-proposal-async-generator-functions";
import proposalClassProperties from "@gerhobbelt/babel-plugin-proposal-class-properties";
import proposalDecorators from "@gerhobbelt/babel-plugin-proposal-decorators";
import proposalDoExpressions from "@gerhobbelt/babel-plugin-proposal-do-expressions";
import proposalExportDefaultFrom from "@gerhobbelt/babel-plugin-proposal-export-default-from";
import proposalExportNamespaceFrom from "@gerhobbelt/babel-plugin-proposal-export-namespace-from";
import proposalFunctionBind from "@gerhobbelt/babel-plugin-proposal-function-bind";
import proposalFunctionSent from "@gerhobbelt/babel-plugin-proposal-function-sent";
import proposalJsonStrings from "@gerhobbelt/babel-plugin-proposal-json-strings";
import proposalLogicalAssignmentOperators from "@gerhobbelt/babel-plugin-proposal-logical-assignment-operators";
import proposalNullishCoalescingOperator from "@gerhobbelt/babel-plugin-proposal-nullish-coalescing-operator";
import proposalNumericSeparator from "@gerhobbelt/babel-plugin-proposal-numeric-separator";
import proposalObjectRestSpread from "@gerhobbelt/babel-plugin-proposal-object-rest-spread";
import proposalOptionalCatchBinding from "@gerhobbelt/babel-plugin-proposal-optional-catch-binding";
import proposalOptionalChaining from "@gerhobbelt/babel-plugin-proposal-optional-chaining";
import proposalPipelineOperator from "@gerhobbelt/babel-plugin-proposal-pipeline-operator";
import proposalPrivateMethods from "@gerhobbelt/babel-plugin-proposal-private-methods";
import proposalThrowExpressions from "@gerhobbelt/babel-plugin-proposal-throw-expressions";
import proposalUnicodePropertyRegex from "@gerhobbelt/babel-plugin-proposal-unicode-property-regex";
import transformAsyncToGenerator from "@gerhobbelt/babel-plugin-transform-async-to-generator";
import transformArrowFunctions from "@gerhobbelt/babel-plugin-transform-arrow-functions";
import transformBlockScopedFunctions from "@gerhobbelt/babel-plugin-transform-block-scoped-functions";
import transformBlockScoping from "@gerhobbelt/babel-plugin-transform-block-scoping";
import transformClasses from "@gerhobbelt/babel-plugin-transform-classes";
import transformComputedProperties from "@gerhobbelt/babel-plugin-transform-computed-properties";
import transformDestructuring from "@gerhobbelt/babel-plugin-transform-destructuring";
import transformDotallRegex from "@gerhobbelt/babel-plugin-transform-dotall-regex";
import transformDuplicateKeys from "@gerhobbelt/babel-plugin-transform-duplicate-keys";
import transformExponentiationOperator from "@gerhobbelt/babel-plugin-transform-exponentiation-operator";
import transformFlowComments from "@gerhobbelt/babel-plugin-transform-flow-comments";
import transformFlowStripTypes from "@gerhobbelt/babel-plugin-transform-flow-strip-types";
import transformForOf from "@gerhobbelt/babel-plugin-transform-for-of";
import transformFunctionName from "@gerhobbelt/babel-plugin-transform-function-name";
import transformInstanceof from "@gerhobbelt/babel-plugin-transform-instanceof";
import transformJscript from "@gerhobbelt/babel-plugin-transform-jscript";
import transformLiterals from "@gerhobbelt/babel-plugin-transform-literals";
import transformMemberExpressionLiterals from "@gerhobbelt/babel-plugin-transform-member-expression-literals";
import transformModulesAmd from "@gerhobbelt/babel-plugin-transform-modules-amd";
import transformModulesCommonjs from "@gerhobbelt/babel-plugin-transform-modules-commonjs";
import transformModulesSystemjs from "@gerhobbelt/babel-plugin-transform-modules-systemjs";
import transformModulesUmd from "@gerhobbelt/babel-plugin-transform-modules-umd";
import transformNewTarget from "@gerhobbelt/babel-plugin-transform-new-target";
import transformObjectAssign from "@gerhobbelt/babel-plugin-transform-object-assign";
import transformObjectSuper from "@gerhobbelt/babel-plugin-transform-object-super";
import transformObjectSetPrototypeOfToAssign from "@gerhobbelt/babel-plugin-transform-object-set-prototype-of-to-assign";
import transformParameters from "@gerhobbelt/babel-plugin-transform-parameters";
import transformPropertyLiterals from "@gerhobbelt/babel-plugin-transform-property-literals";
import transformPropertyMutators from "@gerhobbelt/babel-plugin-transform-property-mutators";
import transformProtoToAssign from "@gerhobbelt/babel-plugin-transform-proto-to-assign";
import transformReactConstantElements from "@gerhobbelt/babel-plugin-transform-react-constant-elements";
import transformReactDisplayName from "@gerhobbelt/babel-plugin-transform-react-display-name";
import transformReactInlineElements from "@gerhobbelt/babel-plugin-transform-react-inline-elements";
import transformReactJsx from "@gerhobbelt/babel-plugin-transform-react-jsx";
import transformReactJsxCompat from "@gerhobbelt/babel-plugin-transform-react-jsx-compat";
import transformReactJsxSelf from "@gerhobbelt/babel-plugin-transform-react-jsx-self";
import transformReactJsxSource from "@gerhobbelt/babel-plugin-transform-react-jsx-source";
import transformRegenerator from "@gerhobbelt/babel-plugin-transform-regenerator";
import transformReservedWords from "@gerhobbelt/babel-plugin-transform-reserved-words";
import transformRuntime from "@gerhobbelt/babel-plugin-transform-runtime";
import transformShorthandProperties from "@gerhobbelt/babel-plugin-transform-shorthand-properties";
import transformSpread from "@gerhobbelt/babel-plugin-transform-spread";
import transformStickyRegex from "@gerhobbelt/babel-plugin-transform-sticky-regex";
import transformStrictMode from "@gerhobbelt/babel-plugin-transform-strict-mode";
import transformTemplateLiterals from "@gerhobbelt/babel-plugin-transform-template-literals";
import transformTypeofSymbol from "@gerhobbelt/babel-plugin-transform-typeof-symbol";
import transformTypescript from "@gerhobbelt/babel-plugin-transform-typescript";
import transformUnicodeRegex from "@gerhobbelt/babel-plugin-transform-unicode-regex";

export {
  externalHelpers,
  syntaxAsyncGenerators,
  syntaxClassProperties,
  syntaxDecorators,
  syntaxDoExpressions,
  syntaxDynamicImport,
  syntaxExportDefaultFrom,
  syntaxExportNamespaceFrom,
  syntaxFlow,
  syntaxFunctionBind,
  syntaxFunctionSent,
  syntaxImportMeta,
  syntaxJsx,
  syntaxObjectRestSpread,
  syntaxOptionalCatchBinding,
  syntaxPipelineOperator,
  syntaxTypescript,
  proposalAsyncGeneratorFunctions,
  proposalClassProperties,
  proposalDecorators,
  proposalDoExpressions,
  proposalExportDefaultFrom,
  proposalExportNamespaceFrom,
  proposalFunctionBind,
  proposalFunctionSent,
  proposalJsonStrings,
  proposalLogicalAssignmentOperators,
  proposalNullishCoalescingOperator,
  proposalNumericSeparator,
  proposalObjectRestSpread,
  proposalOptionalCatchBinding,
  proposalOptionalChaining,
  proposalPipelineOperator,
  proposalPrivateMethods,
  proposalThrowExpressions,
  proposalUnicodePropertyRegex,
  transformAsyncToGenerator,
  transformArrowFunctions,
  transformBlockScopedFunctions,
  transformBlockScoping,
  transformClasses,
  transformComputedProperties,
  transformDestructuring,
  transformDotallRegex,
  transformDuplicateKeys,
  transformExponentiationOperator,
  transformFlowComments,
  transformFlowStripTypes,
  transformForOf,
  transformFunctionName,
  transformInstanceof,
  transformJscript,
  transformLiterals,
  transformMemberExpressionLiterals,
  transformModulesAmd,
  transformModulesCommonjs,
  transformModulesSystemjs,
  transformModulesUmd,
  transformNewTarget,
  transformObjectAssign,
  transformObjectSuper,
  transformObjectSetPrototypeOfToAssign,
  transformParameters,
  transformPropertyLiterals,
  transformPropertyMutators,
  transformProtoToAssign,
  transformReactConstantElements,
  transformReactDisplayName,
  transformReactInlineElements,
  transformReactJsx,
  transformReactJsxCompat,
  transformReactJsxSelf,
  transformReactJsxSource,
  transformRegenerator,
  transformReservedWords,
  transformRuntime,
  transformShorthandProperties,
  transformSpread,
  transformStickyRegex,
  transformStrictMode,
  transformTemplateLiterals,
  transformTypeofSymbol,
  transformTypescript,
  transformUnicodeRegex,
};

export const all = {
  "external-helpers": externalHelpers,
  "syntax-async-generators": syntaxAsyncGenerators,
  "syntax-class-properties": syntaxClassProperties,
  "syntax-decorators": syntaxDecorators,
  "syntax-do-expressions": syntaxDoExpressions,
  "syntax-dynamic-import": syntaxDynamicImport,
  "syntax-export-default-from": syntaxExportDefaultFrom,
  "syntax-export-namespace-from": syntaxExportNamespaceFrom,
  "syntax-flow": syntaxFlow,
  "syntax-function-bind": syntaxFunctionBind,
  "syntax-function-sent": syntaxFunctionSent,
  "syntax-import-meta": syntaxImportMeta,
  "syntax-jsx": syntaxJsx,
  "syntax-object-rest-spread": syntaxObjectRestSpread,
  "syntax-optional-catch-binding": syntaxOptionalCatchBinding,
  "syntax-pipeline-operator": syntaxPipelineOperator,
  "syntax-typescript": syntaxTypescript,
  "proposal-async-generator-functions": proposalAsyncGeneratorFunctions,
  "proposal-class-properties": proposalClassProperties,
  "proposal-decorators": proposalDecorators,
  "proposal-do-expressions": proposalDoExpressions,
  "proposal-export-default-from": proposalExportDefaultFrom,
  "proposal-export-namespace-from": proposalExportNamespaceFrom,
  "proposal-function-bind": proposalFunctionBind,
  "proposal-function-sent": proposalFunctionSent,
  "proposal-json-strings": proposalJsonStrings,
  "proposal-logical-assignment-operators": proposalLogicalAssignmentOperators,
  "proposal-nullish-coalescing-operator": proposalNullishCoalescingOperator,
  "proposal-numeric-separator": proposalNumericSeparator,
  "proposal-object-rest-spread": proposalObjectRestSpread,
  "proposal-optional-catch-binding": proposalOptionalCatchBinding,
  "proposal-optional-chaining": proposalOptionalChaining,
  "proposal-pipeline-operator": proposalPipelineOperator,
  "proposal-private-methods": proposalPrivateMethods,
  "proposal-throw-expressions": proposalThrowExpressions,
  "proposal-unicode-property-regex": proposalUnicodePropertyRegex,
  "transform-async-to-generator": transformAsyncToGenerator,
  "transform-arrow-functions": transformArrowFunctions,
  "transform-block-scoped-functions": transformBlockScopedFunctions,
  "transform-block-scoping": transformBlockScoping,
  "transform-classes": transformClasses,
  "transform-computed-properties": transformComputedProperties,
  "transform-destructuring": transformDestructuring,
  "transform-dotall-regex": transformDotallRegex,
  "transform-duplicate-keys": transformDuplicateKeys,
  "transform-exponentiation-operator": transformExponentiationOperator,
  "transform-flow-comments": transformFlowComments,
  "transform-flow-strip-types": transformFlowStripTypes,
  "transform-for-of": transformForOf,
  "transform-function-name": transformFunctionName,
  "transform-instanceof": transformInstanceof,
  "transform-jscript": transformJscript,
  "transform-literals": transformLiterals,
  "transform-member-expression-literals": transformMemberExpressionLiterals,
  "transform-modules-amd": transformModulesAmd,
  "transform-modules-commonjs": transformModulesCommonjs,
  "transform-modules-systemjs": transformModulesSystemjs,
  "transform-modules-umd": transformModulesUmd,
  "transform-new-target": transformNewTarget,
  "transform-object-assign": transformObjectAssign,
  "transform-object-super": transformObjectSuper,
  "transform-object-set-prototype-of-to-assign": transformObjectSetPrototypeOfToAssign,
  "transform-parameters": transformParameters,
  "transform-property-literals": transformPropertyLiterals,
  "transform-property-mutators": transformPropertyMutators,
  "transform-proto-to-assign": transformProtoToAssign,
  "transform-react-constant-elements": transformReactConstantElements,
  "transform-react-display-name": transformReactDisplayName,
  "transform-react-inline-elements": transformReactInlineElements,
  "transform-react-jsx": transformReactJsx,
  "transform-react-jsx-compat": transformReactJsxCompat,
  "transform-react-jsx-self": transformReactJsxSelf,
  "transform-react-jsx-source": transformReactJsxSource,
  "transform-regenerator": transformRegenerator,
  "transform-reserved-words": transformReservedWords,
  "transform-runtime": transformRuntime,
  "transform-shorthand-properties": transformShorthandProperties,
  "transform-spread": transformSpread,
  "transform-sticky-regex": transformStickyRegex,
  "transform-strict-mode": transformStrictMode,
  "transform-template-literals": transformTemplateLiterals,
  "transform-typeof-symbol": transformTypeofSymbol,
  "transform-typescript": transformTypescript,
  "transform-unicode-regex": transformUnicodeRegex,
};
