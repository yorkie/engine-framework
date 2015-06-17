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

    /**
     * Init this scene wrapper from the previous serialized data.
     * @method _deserialize
     * @param {object} data - the serialized json data
     * @param {_Deserializer} ctx
     * @private
     */
    _deserialize: function (data, ctx) {
        this._serializedData = {
            data: data,
            ctx: ctx
        };
    },

    /**
     * Create scene objects using previous serialized data.
     * @method create
     * @param {function} callback
     * @private
     */
    create: function (callback) {
        // 先反序列化 wrappers，同时递归统计所有需要 preload 的 Asset
        // 然后 this.preloadAssets();
        // 最后由 wrappers 创建 nodes，挂 mixins 脚本，使用 exists target 模式 反序列化 mixins 数据
    }
});

if (FIRE_EDITOR) {

    var serialize = require('../../editor/serialize');

    var parseWrappers = function (node) {
        var wrapper = Fire.node(node);
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
