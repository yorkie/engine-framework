var root = typeof global !== 'undefined' ? global : window;

/**
 * !#en
 * Global object with runtime classes, properties and methods you can access from anywhere.
 * Submodules:
 * - [JS](./Fire.JS.html)
 *
 * !#zh
 * 可全局访问的公共方法和属性，也会包括一些组件和类的静态方法
 * 包含的子模块:
 * - [JS](./Fire.JS.html)
 *
 * @module Fire
 * @main Fire
 */
if (!root.Fire) {
    // Always export Fire globally.
    root.Fire = {};
}

require('./definition');

// Always export FIRE_DEBUG, FIRE_DEV globally
if (typeof FIRE_DEBUG === 'undefined') {
    FIRE_DEBUG = true;
}
if (typeof FIRE_DEV === 'undefined') {
    FIRE_DEV = FIRE_EDITOR || FIRE_DEBUG;
}

// javascript extends
require('./js');
require('./log');
require('./math');
require('./utils');
require('./enum');
require('./fobject');
require('./class-new');
//

//require('./deserialize');
//require('./engine');

module.exports = Fire;
