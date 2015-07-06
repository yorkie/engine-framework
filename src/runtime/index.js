
/**
 * This module provides interfaces for runtime implementation.
 * @module Fire.Runtime
 * @main
 */

var Runtime = {};

var register = require('./register');
var NodeWrapper = require('./wrappers/node');

Fire.JS.mixin(Runtime, {
    NodeWrapper: NodeWrapper,
    SceneWrapper: require('./wrappers/scene'),
    registerNodeType: register.registerNodeType,

    registerMixin: register.registerMixin,

    EngineWrapper: require('./wrappers/engine'),
    registerEngine: register.registerEngine
});

// load utility methods
require('./extends/node');
require('./extends/scene');
require('./extends/engine');

// register a default mixin solution
var mixin = require('./mixin');
register.registerMixin(mixin);

/**
 * @module Fire
 */

Fire.getWrapperType = register.getWrapperType;
Fire.menuToWrapper = register.menuToWrapper;
Fire.node = NodeWrapper.getWrapper;

var mixin = register.getMixinOptions();
Fire.mixin = mixin.mixin;
Fire.hasMixin = mixin.hasMixin;

///**
// * The SceneWrapper class registered by runtime.
// * @property SceneWrapperImpl
// * @type {Fire.Runtime.SceneWrapper}
// */
//Fire.JS.get(Fire, 'SceneWrapperImpl', register.getRegisteredSceneWrapper);



module.exports = Runtime;
