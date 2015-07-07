// The default mixin solution
var JS = Fire.JS;
var Wrapper = require('./wrappers/node');

//var tmpArray = [];

var mixin = {
    mixin: function (node, typeOrTypename) {

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

        if (FIRE_EDITOR && !Fire._isFireClass(classToMix)) {
            Fire.error('Fire.mixin: The class to mixin must be FireClass.');
            return;
        }
        var newMixinClassId = JS._getClassId(classToMix);
        if (FIRE_EDITOR && !newMixinClassId) {
            Fire.error("Fire.mixin: The class to mixin must have class name or script's uuid.");
            return;
        }

        if (node instanceof Wrapper) {
            node = node.runtimeTarget;
        }

        if (!node) {
            Fire.error("Fire.mixin: The node to mixin must be non-nil.");
            return;
        }

        // call constructor on node
        classToMix.call(node);

        var nodeClass = node.constructor;

        // mixin prototype
        //var nodeProto = nodeClass.prototype;
        var clsProto = classToMix.prototype;
        JS.mixin(node, clsProto);  // 这里也会 mixin cls 的父类的 prototype

        // restore overrided properties
        node.constructor = nodeClass;

        // remove properties no need to mixin
        node.__cid__ = undefined;
        node.__classname__ = undefined;

        // declare mixin classes
        var _mixinClasses = node._mixinClasses;
        if (_mixinClasses) {
            _mixinClasses.push(classToMix);
        }
        else {
            node._mixinClasses = [classToMix];
        }

        // TODO - behaviours
    },

    hasMixin: function (node, typeOrTypename) {
        if (node instanceof Wrapper) {
            node = node.runtimeTarget;
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
                    Fire.error('Fire.hasMixin: Failed to get class "%s"');
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
    }
};

module.exports = mixin;
