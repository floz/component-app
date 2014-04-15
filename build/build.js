/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("./app/utils", function (exports, module) {
index.js
});

require.register("./app/utils/toto.js", function (exports, module) {

});

require.register("./app/pages/toto", function (exports, module) {
var utils = require( "utils" );
});

require.register("./app/pages/contact", function (exports, module) {
var utils = require( "utils" );
var toto = require( "toto" );
var test = require( "test" );

console.log( "contact" );
});

require.register("./app/common/test", function (exports, module) {
var contact = require( "contact" );
var utils = require( "utils" );
});

require.register("./app/boot", function (exports, module) {
var toto = require( "toto" );
var test = require( "test" );
});

require("./app/boot")
