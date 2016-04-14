# Babel Plugin for Importing Ember Addons into the global namespace.

Hooray, you're trying to import an Ember Addon into a Node project!

You've probably noticed that Ember doesn't use an absolute namespace for
a project, but assumes that /addon or /app are the base.  This plugin
allows you to rewrite imports from specific modules to include the addon
or app path.

## Usage

You'll want to start off with all of the es2015 plugins, but replacing
the modules-commonjs plugin with this one. Then define your module
replacements, which have a simple in/out, as shown below

    {
      "plugins": [
        "babel-plugin-transform-es2015-template-literals",
        "babel-plugin-transform-es2015-literals",
        "babel-plugin-transform-es2015-function-name",
        "babel-plugin-transform-es2015-arrow-functions",
        "babel-plugin-transform-es2015-block-scoped-functions",
        "babel-plugin-transform-es2015-classes",
        "babel-plugin-transform-es2015-object-super",
        "babel-plugin-transform-es2015-shorthand-properties",
        "babel-plugin-transform-es2015-duplicate-keys",
        "babel-plugin-transform-es2015-computed-properties",
        "babel-plugin-transform-es2015-for-of",
        "babel-plugin-transform-es2015-sticky-regex",
        "babel-plugin-transform-es2015-unicode-regex",
        "babel-plugin-check-es2015-constants",
        "babel-plugin-transform-es2015-spread",
        "babel-plugin-transform-es2015-parameters",
        "babel-plugin-transform-es2015-destructuring",
        "babel-plugin-transform-es2015-block-scoping",
        "babel-plugin-transform-es2015-typeof-symbol",
        ["transform-es2015-modules-commonjs-ember", {
          moduleReplacements: [
            {in:'my-ember-addon', out:'my-ember-addon/addon'},
            {in:'my-ember-app', out:'my-ember-app/app'}
          ]
        }],
        ["babel-plugin-transform-regenerator", { async: false, asyncGenerators: false }]
      ]
    }

The main caveat here is that we are not actually combining or changing
the actual namespaces, simply the way that the namespace is re-written
from import -> require. This means that you can only import from app or
addon... it is NOT exactly the same as ember's more complicated namespacing...
only a rough approximation.
