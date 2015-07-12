var root = typeof global !== 'undefined' ? global : window;

/**
 * Global object with classes, properties and methods you can access in fireball editor.
 *
 * @module Editor
 * @main Editor
 */

if (!root.Editor) {
    // Always export Editor globally.
    root.Editor = {};
}

//// extends engine
//require('./extends/runtime');

require('./serialize');
require('./get-node-dump');
require('./set-property-by-path');
require('./utils');

if (!FIRE_TEST) {
    // redirect log methods to fireball console
    Fire.log = Editor.log;
    Fire.info = Editor.info;
    Fire.warn = Editor.warn;
    Fire.error = Editor.error;
}

if (Editor.isCoreLevel) {
    // declare global variables that can be accessed remotely in page-level
    Editor.nodeCreateMenu = null;
}

module.exports = Editor;
