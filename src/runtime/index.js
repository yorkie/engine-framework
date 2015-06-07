
/**
 * This module provides interfaces for runtime implementation.
 * @module Fire.Runtime
 * @main
 */

var Runtime = {};

var register = require('./register');

Fire.JS.mixin(Runtime, {
    NodeWrapper: require('./wrappers/node'),
    SceneWrapper: require('./wrappers/node'),
    registerNodeType: register.registerNodeType
});

module.exports = Runtime;

/**
 * @module Fire
 */

Fire.getWrapperType = register.getWrapperType;
Fire.node = register.getWrapper;

/**
 * The SceneWrapper class registered by runtime.
 * @property SceneWrapperImpl
 * @type {Fire.Runtime.SceneWrapper}
 */
Fire.JS.get(Fire, 'SceneWrapperImpl', register.getRegisteredSceneWrapper);

// add utility methods
require('./extends');
