// The default mixin solution
var JS = Fire.JS;
var Wrapper = require('./wrappers/node');
var Behavior = require('./behavior');
var instantiateProps = require('../core/class').instantiateProps;

var LifecycleMethods = Behavior.LCMethodNames;
var lcmInvokers = Behavior.lcmInvokers;

function callInTryCatch (method, target) {
    try {
        method.call(target);
    }
    catch (e) {
        Fire._throw(e);
    }
}

function mixin (node, typeOrTypename) {
    'use strict';
    if (arguments.length > 2) {
        for (var a = 1; a < arguments.length; a++) {
            mixin(node, arguments[a]);
        }
        return;
    }
    var classToMix;
    if (typeof typeOrTypename === 'string') {
        classToMix = JS.getClassByName(typeOrTypename);
        if ( !classToMix ) {
            Fire.error('Fire.mixin: Failed to get class "%s"');
            if (Fire._RFpeek()) {
                Fire.error('You should not mixin %s when the scripts are still loading.', typeOrTypename);
            }
        }
    }
    else {
        if ( !typeOrTypename ) {
            Fire.error('Fire.mixin: The class to mixin must be non-nil');
        }
        classToMix = typeOrTypename;
    }

    if (FIRE_EDITOR) {
        // validate
        if (!Fire._isFireClass(classToMix)) {
            Fire.error('Fire.mixin: The class to mixin must be FireClass.');
            return;
        }
        if (!JS._getClassId(classToMix) && !FIRE_TEST) {
            Fire.error("Fire.mixin: The class to mixin must have class name or script's uuid.");
            return;
        }
        if (!Fire.isChildClassOf(classToMix, Behavior)) {
            Fire.warn("Fire.mixin: The class to mixin must inherit from Fire.Behavior.");
            return;
        }
    }

    if (node instanceof Wrapper) {
        node = node.targetN;
    }

    if (!node) {
        Fire.error("Fire.mixin: The node to mixin must be non-nil.");
        return;
    }

    if (FIRE_EDITOR && node._mixinClasses && node._mixinClasses.indexOf(classToMix) !== -1) {
        Fire.warn("Fire.mixin: The class has already mixined.");
        return;
    }

    // init props
    instantiateProps(node, classToMix);

    // creating mixin script context
    var scriptCtx = {
        _objFlags: 0,
    };

    var mixinData;

    // maintain mixin states
    var _mixinClasses = node._mixinClasses;
    if (_mixinClasses) {
        _mixinClasses.push(classToMix);
        node._mixinContexts.push(scriptCtx);
        mixinData = node._mixin;
    }
    else {
        node._mixinClasses = [classToMix];
        node._mixinContexts = [scriptCtx];
        mixinData = {
            lcmInitStates: LifecycleMethods.map(function () { return false; })
        };
        node._mixin = mixinData;
    }

    // DO MIXIN
    var lcmInitStates = mixinData.lcmInitStates;
    var classToMixProto = classToMix.prototype;
    for (var propName in classToMixProto) {
        if (propName !== '__cid__' &&
            propName !== '__classname__' &&
            propName !== 'constructor') {
            // TODO - dont mixin class attr
            var pd = JS.getPropertyDescriptor(classToMixProto, propName);
            var lcmIndex = LifecycleMethods.indexOf(propName);
            var isLifecycleMethods = lcmIndex !== -1;
            if (isLifecycleMethods) {
                scriptCtx[propName] = pd.value;
                if (! lcmInitStates[lcmIndex]) {
                    lcmInitStates[lcmIndex] = true;
                    // Fire.warn("Fire.mixin: %s's %s is overridden", Fire(node).name, propName);
                    (function () {
                        var invoker = lcmInvokers[propName];
                        var originMethod = node[propName];
                        if (originMethod) {
                            node[propName] = function () {
                                originMethod.apply(this, arguments);
                                invoker.apply(this, arguments);
                            };
                        }
                        else {
                            node[propName] = invoker;
                        }
                    })();
                }
            }
            else {
                Object.defineProperty(node, propName, pd);
            }
        }
    }

    //// cache lifecycle methods
    //for (var j = 0; j < LifecycleMethods.length; j++) {
    //    var method = LifecycleMethods[j];
    //}

    if ((!FIRE_EDITOR || (Fire.engine && Fire.engine._isPlaying)) && !Fire.engine._isCloning) {
        // invoke onLoad
        var onLoad = classToMixProto.onLoad;
        if (onLoad) {
            if (FIRE_EDITOR) {
                callInTryCatch(onLoad, node);
            }
            else {
                onLoad.call(node);
            }
        }
    }
}

var exports = {

    mixin: mixin,

    hasMixin: function (node, typeOrTypename) {
        if (node instanceof Wrapper) {
            node = node.targetN;
        }

        if (!node) {
            return false;
        }

        var mixinClasses = node._mixinClasses;
        if (mixinClasses) {
            var classToMix;
            if (typeof typeOrTypename === 'string') {
                classToMix = JS.getClassByName(typeOrTypename);
                if ( !classToMix ) {
                    Fire.error('Fire.hasMixin: Failed to get class "%s"', typeOrTypename);
                    return false;
                }
            }
            else {
                if ( !typeOrTypename ) {
                    return false;
                }
                classToMix = typeOrTypename;
            }
            return mixinClasses.indexOf(classToMix) !== -1;
        }
        return false;
    },

    unMixin: function (node, typeOrTypename) {
        if (!FIRE_EDITOR || Fire.engine.isPlaying) {
            return Fire.warn("Fire.unMixin: Sorry, can not un-mixin when the engine is playing.");
        }

        if (node instanceof Wrapper) {
            node = node.targetN;
        }

        if (!node) {
            return Fire.error("Fire.unMixin: The node to un-mixin must be non-nil.");
        }

        var mixinClasses = node._mixinClasses;
        if (mixinClasses) {
            var classToUnmix;
            if (typeof typeOrTypename === 'string') {
                classToUnmix = JS.getClassByName(typeOrTypename);
                if ( !classToUnmix ) {
                    return Fire.error('Fire.unMixin: Failed to get class "%s"', typeOrTypename);
                }
            }
            else {
                if ( !typeOrTypename ) {
                    return Fire.error('Fire.unMixin: The class to un-mixin must be non-nil');
                }
                classToUnmix = typeOrTypename;
            }

            var index = mixinClasses.indexOf(classToUnmix);
            if (index !== -1) {
                mixinClasses.splice(index, 1);
                node._mixinContexts.splice(index, 1);
                return;
            }
        }
        return Fire.error('Fire.unMixin: Can not find mixed class "%s" in node "%s".',
            typeOrTypename, Fire(node).name);
    }
};

module.exports = exports;
