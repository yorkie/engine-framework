var root = typeof global !== 'undefined' ? global : window;

/**
 * !#en
 * Global object with runtime classes, properties and methods you can access from anywhere.
 *
 * Submodules:
 * - [JS](./Fire.JS.html)
 * - [Runtime](./Fire.Runtime.html)
 *
 * !#zh
 * 可全局访问的公共方法和属性，也会包括一些组件和类的静态方法
 *
 * 包含的子模块:
 * - [JS](./Fire.JS.html)
 * - [Runtime](./Fire.Runtime.html)
 *
 * @module Fire
 * @main Fire
 */
if (!root.Fire) {
    // Always export Fire globally.
    root.Fire = {};
}

require('./definition');

// Declare pre-process macros globally for uglify
if (typeof FIRE_DEBUG === 'undefined') {
    FIRE_DEBUG = true;
}
if (typeof FIRE_DEV === 'undefined') {
    FIRE_DEV = FIRE_EDITOR || FIRE_DEBUG;
}
if (typeof FIRE_TEST === 'undefined') {
    FIRE_TEST = false;
}

// javascript extends

require('./js');
if (!Fire.log) {
    // 编辑器已经定义了 Fire.log
    require('./log');
}
require('./math');
require('./utils');
require('./enum');
require('./fobject');
require('./class-new');
require('./value-types');
require('./callbacks-invoker');
require('./path');
require('./intersection');
require('./polygon');

// engine toolkit

require('./asset');
require('./deserialize');
require('./event/event-target');
require('./playable');

// script management

require('./requiring-frame');

if (Fire.isWeb) {
    // codes only available in page level
    require('./ticker');
    require('./time');
    require('./loaders');
    require('./load-manager');
    require('./asset-library');
}

module.exports = Fire;
