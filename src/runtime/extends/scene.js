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
            wrapper.parentNode = parentWrapper.target;
            var classIdToMixin = child.m;
            if (classIdToMixin) {
                var ClassToMixin;
                if (Array.isArray(classIdToMixin)) {
                    for (var i = 0; i < classIdToMixin.length; i++) {
                        ClassToMixin = JS._getClassById(classIdToMixin);
                        if (ClassToMixin) {
                            mixin(wrapper.target, ClassToMixin);
                            Fire.deserialize.applyMixinProps(child.t, ClassToMixin, wrapper.target);
                        }
                        else {
                            Fire.error('Failed to find class %s to mixin', classIdToMixin);
                        }
                    }
                }
                else {
                    ClassToMixin = JS._getClassById(classIdToMixin);
                    if (ClassToMixin) {
                        mixin(wrapper.target, ClassToMixin);
                        Fire.deserialize.applyMixinProps(child.t, ClassToMixin, wrapper.target);
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
        // 统计所有需要 preload 的 Asset
        var recordAssets = true;
        var handle = Fire.AssetLibrary.loadJson(json, function (err, data) {
            self._dataToDeserialize = null;
            var wrappers = data;
            // preload
            self.preloadAssets(handle.assetsNeedPostLoad, function () {
                // 由 wrappers 创建 nodes
                self.onAfterDeserialize();
                self._initNodes(wrappers, self);
                callback();
            });
        }, true, recordAssets);
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
        var childNodes = wrapper.childNodes;
        if (childNodes.length > 0) {
            children = childNodes.map(parseWrappers);
        }
        var mixinClasses = node._mixinClasses;
        var target = mixinClasses ? node : undefined;

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
            t: target,
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

        var childWrappers = parseWrappers(this.target).c || [];
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

    var getChildNodes = function (node) {
        var wrapper = Fire.node(node);
        var childNodes = wrapper.childNodes;
        return {
            name: wrapper.name,
            children: childNodes.length > 0 ? childNodes.map(getChildNodes) : null
        };
    };

    /**
     * @method takeHierarchySnapshot
     * @return {object[]}
     */
    Fire.takeHierarchySnapshot = function () {
        var root = Fire.Engine.getCurrentSceneNode();
        var children = Fire.node(root).childNodes;
        return children.map(getChildNodes);
    };
}
