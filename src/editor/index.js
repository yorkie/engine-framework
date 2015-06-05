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

module.exports = Editor;
