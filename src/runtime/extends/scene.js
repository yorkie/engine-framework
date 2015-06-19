var JS = Fire.JS;

/**
 * @module Fire.Runtime
 */

/**
 * @class SceneWrapper
 */
var SceneWrapper = require('../wrappers/scene');

/**
 * Get the current running scene.
 * @method getCurrentScene
 * @return {SceneWrapper}
 * @static
 */
SceneWrapper.getCurrentScene = function () {
    return Fire.node(Fire.SceneWrapperImpl.getCurrentSceneNode());
};

var sceneProto = SceneWrapper.prototype;

JS.mixin(sceneProto, {
    isScene: true,

    _initWrappers: function (wrappers, parentWrapper) {
        for (var i = 0, len = wrappers.length; i < len; i++) {
            var child = wrappers[i];
            var wrapper = child.w;
            wrapper.onAfterDeserialize();
            wrapper.parentNode = parentWrapper.target;
            var children = child.c;
            if (children) {
                this._initWrappers(children, wrapper);
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
            var wrappers = data.wrappers;
            var mixins = data.mixins;
            // preload
            self.preloadAssets(handle.assetsNeedPostLoad, function () {
                // 由 wrappers 创建 nodes
                self.onAfterDeserialize();
                self._initWrappers(wrappers, self);
                // TODO - 挂 mixins 脚本，使用 exists target 模式 反序列化 mixins 数据
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
        //
        //var tdInfo = new Fire._DeserializeInfo();
        //data = Fire.deserialize(data, tdInfo);

        // save temporarily for create()
        this._dataToDeserialize = {
            json: data,
            ctx: ctx
        };
    }
});

if (FIRE_EDITOR) {

    var serialize = require('../../editor/serialize');

    var parseWrappers = function (node) {
        var wrapper = Fire.node(node);
        wrapper.onBeforeSerialize();
        var childNodes = wrapper.childNodes;
        if (childNodes.length > 0) {
            return {
                w: wrapper,
                c: childNodes.map(parseWrappers)
            };
        }
        else {
            return {
                w: wrapper
            };
        }
    };

    /**
     * The implement of serialization for the whole scene.
     * @method _serialize
     * @param {boolean} exporting
     * @return {object} the serialized json data object
     * @private
     */
    sceneProto._serialize = function (exporting) {
        this.onBeforeSerialize();

        // build hierarchy
        var childWrappers = parseWrappers(this.target).c || [];
        var mixins = null;  // TODO

        var toSerialize = {
            wrappers: childWrappers,
            mixins: mixins
        };
        return serialize(toSerialize, {
            exporting: exporting,
            stringify: false
        });
    };


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
        var root = register.getRegisteredSceneWrapper().getCurrentSceneNode();
        var children = Fire.node(root).childNodes;
        return children.map(getChildNodes);
    };
}
