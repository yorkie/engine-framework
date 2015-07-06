var JS = Fire.JS;
var mixin = require('../mixin').mixin;

/**
 * @module Fire.Runtime
 */

/**
 * @class SceneWrapper
 */
var SceneWrapper = require('../wrappers/scene');

var sceneProto = SceneWrapper.prototype;

JS.mixin(sceneProto, {
    isScene: true,

    _initNodes: function (datas, parentWrapper) {
        for (var i = 0, len = datas.length; i < len; i++) {
            var child = datas[i];
            var wrapper = child.w;
            wrapper.onAfterDeserialize();
            wrapper.runtimeParent = parentWrapper.runtimeTarget;
            var classIdToMixin = child.m;
            if (classIdToMixin) {
                var ClassToMixin;
                if (Array.isArray(classIdToMixin)) {
                    for (var i = 0; i < classIdToMixin.length; i++) {
                        ClassToMixin = JS._getClassById(classIdToMixin);
                        if (ClassToMixin) {
                            mixin(wrapper.runtimeTarget, ClassToMixin);
                            Fire.deserialize.applyMixinProps(child.t, ClassToMixin, wrapper.runtimeTarget);
                        }
                        else {
                            Fire.error('Failed to find class %s to mixin', classIdToMixin);
                        }
                    }
                }
                else {
                    ClassToMixin = JS._getClassById(classIdToMixin);
                    if (ClassToMixin) {
                        mixin(wrapper.runtimeTarget, ClassToMixin);
                        Fire.deserialize.applyMixinProps(child.t, ClassToMixin, wrapper.runtimeTarget);
                    }
                    else {
                        Fire.error('Failed to find class %s to mixin', classIdToMixin);
                    }
                }
            }
            var children = child.c;
            if (children) {
                this._initNodes(children, wrapper);
            }
        }
    },

    /**
     * Create scene objects using previous serialized data.
     * @method create
     * @param {function} callback
     * @private
     */
    create: function (callback) {
        if (FIRE_EDITOR) {
            if (!this._dataToDeserialize) {
                Fire.error('No need to create scene which not deserialized');
                return callback();
            }
        }
        var self = this;
        // deserialize (create wrappers)
        var json = this._dataToDeserialize.json;

        //
        function doCreate (wrappers) {
            // create scene node
            self.onAfterDeserialize();
            // create remainder nodes
            self._initNodes(wrappers, self);
            callback();
        }

        // 统计所有需要 preload 的 Asset
        var recordAssets = true;
        var handle = Fire.AssetLibrary.loadJson(
            json,
            function (err, data) {
                self._dataToDeserialize = null;
                var wrappers = data;
                if (handle.assetsNeedPostLoad.length > 0) {
                    // preload
                    self.preloadAssets(handle.assetsNeedPostLoad, function () {
                        doCreate(wrappers);
                    });
                }
                else {
                    doCreate(wrappers);
                }
            },
            true, recordAssets
        );
    },

    /**
     * Init this scene wrapper from the previous serialized data.
     * @method _deserialize
     * @param {object} data - the serialized json data
     * @param {_Deserializer} ctx
     * @private
     */
    _deserialize: function (data, ctx) {
        // save temporarily for create()
        this._dataToDeserialize = {
            json: data
        };
    }
});

/**
 * @property {Boolean} _needCreate - Needs to call create().
 * @private
 */
JS.get(sceneProto, '_needCreate', function () {
    return !!this._dataToDeserialize;
});

if (FIRE_EDITOR) {

    var serialize = require('../../editor/serialize');

    //var getMixinData = function (node) {
    //
    //};

    var parseWrappers = function (node) {
        var wrapper = Fire.node(node);
        wrapper.onBeforeSerialize();
        var children;
        var runtimeChildren = wrapper.runtimeChildren;
        if (runtimeChildren.length > 0) {
            children = runtimeChildren.map(parseWrappers);
        }
        var mixinClasses = node._mixinClasses;
        var runtimeTarget = mixinClasses ? node : undefined;

        var mixin;
        if (mixinClasses) {
            if (mixinClasses.length === 1) {
                mixin = JS._getClassId(mixinClasses[0]);
            }
            else {
                mixin = mixinClasses.map(JS._getClassId);
            }
        }
        return {
            w: wrapper,
            c: children,
            t: runtimeTarget,
            m: mixin
        };
    };

    JS.mixin(sceneProto, {
        /**
         * The implement of serialization for the whole scene.
         * @method _serialize
         * @param {boolean} exporting
         * @return {object} the serialized json data object
         * @private
         */
        _serialize: function (exporting) {
            this.onBeforeSerialize();

            var childWrappers = parseWrappers(this.runtimeTarget).c || [];
            var toSerialize = childWrappers;

            return serialize(toSerialize, {
                exporting: exporting,
                stringify: false
            });
        }
    });


    /**
     * @module Fire
     */

    var getruntimeChildren = function (node) {
        var wrapper = Fire.node(node);
        var runtimeChildren = wrapper.runtimeChildren;
        return {
            name: wrapper.name,
            id: wrapper.id,
            children: runtimeChildren.length > 0 ? runtimeChildren.map(getruntimeChildren) : null
        };
    };

    /**
     * @method takeHierarchySnapshot
     * @return {object[]}
     */
    Fire.takeHierarchySnapshot = function () {
        var root = Fire.engine.getCurrentRuntimeScene();
        var children = Fire.node(root).runtimeChildren;
        return children.map(getruntimeChildren);
    };
}
