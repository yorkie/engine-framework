/**
 * @module Fire.Runtime
 */

var JS = Fire.JS;
var Vec2 = Fire.Vec2;
var Rect = Fire.Rect;
var Utils = require('./utils');
var NYI = Utils.NYI;
var NYI_Accessor = Utils.NYI_Accessor;

var INVISIBLE = {
    visible: false
};

var ERR_NaN = 'The %s must not be NaN';

/**
 * 这个类用来封装编辑器针对节点的操作。
 * Note: 接口中包含 "Node" 的使用的都是 Runtime 的原生 Node 类型。
 *
 * You should override:
 * - createEmpty (static)
 * - name
 * - runtimeParent
 * - runtimeChildren
 * - position
 * - worldPosition
 * - rotation
 * - worldRotation
 * - scale
 * - worldScale
 * - getWorldBounds
 * - getWorldOrientedBounds
 * - transformPoints
 * - inverseTransformPoints
 * - onBeforeSerialize (so that the node's properties can be serialized in wrapper)
 * - createRuntimeNode
 *
 * You may want to override:
 * - setSiblingIndex
 * - getSiblingIndex
 * - x
 * - y
 * - worldX
 * - worldY
 * - scaleX
 * - scaleY
 * - scenePosition
 * - attached
 *
 * @class NodeWrapper
 * @constructor
 * @param {RuntimeNode} node
 */
var NodeWrapper = Fire.Class({
    name: 'Fire.Runtime.NodeWrapper',
    extends: Fire.FObject,

    constructor: function () {
        /**
         * The runtimeTarget node to wrap.
         * @property runtimeTarget
         * @type {RuntimeNode}
         */
        this.runtimeTarget = arguments[0];
        if (this.runtimeTarget) {
            this.attached();
        }

        this.gizmo = null;
        this.mixinGizmos = [];

        //if (FIRE_EDITOR && !this.runtimeTarget) {
        //    Fire.warn('runtimeTarget of %s must be non-nil', JS.getClassName(this));
        //}
    },

    properties: {
        ///**
        // * The class ID of attached script.
        // * @property mixinId
        // * @type {string|string[]}
        // * @default ""
        // */
        //mixinId: {
        //    default: "",
        //    visible: false
        //},

        /**
         * The name of the node.
         * @property name
         * @type {string}
         */
        name: {
            get: function () {
                return '';
            },
            set: function (value) {
            }
        },

        /**
         * !#en the instance id, must be type string
         * !#zh 节点ID，是字符串类型
         * @property id
         * @type {string}
         * @readOnly
         */
        id: NYI_Accessor('', INVISIBLE, true),

        // HIERARCHY

        /**
         * The runtime parent of the node.
         * If this is the top most node in hierarchy, the wrapper of its parent must be type SceneWrapper.
         * Changing the parent will keep the transform's local space position, rotation and scale the same but modify
         * the world space position, scale and rotation.
         * @property runtimeParent
         * @type {RuntimeNode}
         */
        runtimeParent: NYI_Accessor(null, INVISIBLE),

        /**
         * Returns the array of children. If no child, this method should return an empty array.
         * The returns array can be modified ONLY in setSiblingIndex.
         * @property runtimeChildren
         * @type {RuntimeNode[]}
         * @readOnly
         */
        runtimeChildren: NYI_Accessor([], INVISIBLE, true),

        // TRANSFORM

        /**
         * The local position in its parent's coordinate system
         * @property position
         * @type {Fire.Vec2}
         */
        position: NYI_Accessor(Vec2.zero),

        /**
         * The local x position in its parent's coordinate system
         * @property x
         * @type {number}
         */
        x: {
            get: function () {
                return this.position.x;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    var p = this.position;
                    p.x = value;
                    this.position = p;
                }
                else {
                    Fire.error(ERR_NaN, 'new x');
                }
            },
            visible: false
        },

        /**
         * The local y position in its parent's coordinate system
         * @property y
         * @type {number}
         */
        y: {
            get: function () {
                return this.position.y;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    var p = this.position;
                    p.y = value;
                    this.position = p;
                }
                else {
                    Fire.error(ERR_NaN, 'new y');
                }
            },
            visible: false
        },

        /**
         * The position of the transform in world space
         * @property worldPosition
         * @type {Fire.Vec2}
         */
        worldPosition: NYI_Accessor(Vec2.zero, INVISIBLE),

        /**
         * The x position of the transform in world space
         * @property worldX
         * @type {number}
         */
        worldX: {
            get: function () {
                return this.worldPosition.x;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    var p = this.worldPosition;
                    p.x = value;
                    this.worldPosition = p;
                }
                else {
                    Fire.error(ERR_NaN, 'new worldX');
                }
            },
            visible: false
        },

        /**
         * The y position of the transform in world space
         * @property worldY
         * @type {number}
         */
        worldY: {
            get: function () {
                return this.worldPosition.y;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    var p = this.worldPosition;
                    p.y = value;
                    this.worldPosition = p;
                }
                else {
                    Fire.error(ERR_NaN, 'new worldY');
                }
            },
            visible: false
        },

        /**
         * The counterclockwise degrees of rotation relative to the parent
         * @property rotation
         * @type {number}
         */
        rotation: NYI_Accessor(0, {
            tooltip: "The counterclockwise degrees of rotation relative to the parent"
        }),

        /**
         * The counterclockwise degrees of rotation in world space
         * @property worldRotation
         * @type {number}
         */
        worldRotation: NYI_Accessor(0, INVISIBLE),

        /**
         * The local scale factor relative to the parent
         * @property scale
         * @type {Fire.Vec2}
         */
        scale: NYI_Accessor(Vec2.one),

        /**
         * The local x scale factor relative to the parent
         * @property scaleX
         * @type {number}
         */
        scaleX: {
            get: function () {
                return this.scale.x;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    var p = this.scale;
                    p.x = value;
                    this.scale = p;
                }
                else {
                    Fire.error(ERR_NaN, 'new scaleX');
                }
            },
            visible: false
        },

        /**
         * The local y scale factor relative to the parent
         * @property scaleY
         * @type {number}
         */
        scaleY: {
            get: function () {
                return this.scale.y;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    var p = this.scale;
                    p.y = value;
                    this.scale = p;
                }
                else {
                    Fire.error(ERR_NaN, 'new scaleY');
                }
            },
            visible: false
        },

        /**
         * The lossy scale of the transform in world space (Read Only)
         * @property worldScale
         * @type {Fire.Vec2}
         * @readOnly
         */
        worldScale: NYI_Accessor(Vec2.one, INVISIBLE, true),

        root: {
            get: function () {
                var node = this;
                var next = node.parent;
                while (next) {
                    node = next;
                    next = next.parent;
                }
                return node;
            }
        }
    },

    statics: {
        ///**
        // * Creates a new node without any resources.
        // * @method createEmpty
        // * @return {RuntimeNode}
        // * @static
        // */
        //createEmpty: function () {
        //    if (FIRE_EDITOR) {
        //        Fire.error('Not yet implemented');
        //    }
        //    return null;
        //},
    },

    // SERIALIZATION

    /**
     * Creates a new node using the properties defined in this wrapper, the properties will be serialized in the scene.
     * Note: 不需要设置新节点的父子关系，也不需要设置 wrapper 的 runtimeTarget 为新节点.
     * @method createRuntimeNode
     * @return {RuntimeNode} - the created node
     */
    createRuntimeNode: function () {
        NYI();
        return null;
    },

    /**
     * 这个方法会在场景保存前调用，你可以将 node 的属性保存到 wrapper 的可序列化的 properties 中，
     * 以便在 createRuntimeNode() 方法中重新设置好 node。
     * @method onBeforeSerialize
     */
    onBeforeSerialize: function () {
    },

    /**
     * Creates a new node and bind with this wrapper.
     * @method onAfterDeserialize
     */
    onAfterDeserialize: function () {
        var node = this.createRuntimeNode();
        this.runtimeTarget = node;
        node._FB_wrapper = this;
        this.attached();
    },

    /**
     * Invoked after the wrapper's runtimeTarget is assigned. Override this method if you need to initialize your node.
     * @method attached
     */
    attached: function () {
    },

    ///**
    // * This method is called when the scene is saving, allowing you to return JSON to represent the state of your node.
    // * When the scene is later loaded, the data you returned is passed to the wrapper's deserialize method so you can
    // * restore the node.
    // * @method serialize
    // * @return {object} - a JSON represents the state of the runtimeTarget node
    // */
    //serialize: function (data) {
    //    if (FIRE_EDITOR) {
    //        Fire.error('Not yet implemented');
    //    }
    //    return null;
    //},
    //
    ///**
    // * @callback deserializeCallback
    // * @param {string} error - null or the error info
    // * @param {RuntimeNode} node - the loaded node or null
    // */
    //
    ///**
    // * Creates a new node using the state data from the last time the scene was serialized if the wrapper implements the serialize() method.
    // * @method deserializeAsync
    // * @param {object} data - the JSON data returned from serialize() method
    // * @param {deserializeCallback} callback - Should not being called in current tick.
    // *                                         If there's no async operation, use Fire.nextTick to simulate.
    // */
    //deserializeAsync: function (data, callback) {
    //    Fire.nextTick(callback, 'Not yet implemented', null);
    //},

    ///**
    // * Creates a new node using the state data from the last time the scene was serialized if the wrapper implements the serialize() method.
    // * @method deserialize
    // * @param {object} data - the JSON data returned from serialize() method
    // * @return {RuntimeNode}
    // */
    //deserialize: function (data) {
    //    if (FIRE_EDITOR) {
    //        Fire.error('Not yet implemented');
    //    }
    //    return null;
    //},

    // HIERARCHY

    /**
     * Get the sibling index.
     *
     * NOTE: If this node does not have parent and not belongs to the current scene,
     *       The return value will be -1
     *
     * @method getSiblingIndex
     * @return {number}
     */
    getSiblingIndex: function () {
        return Fire.node(this.runtimeParent).runtimeChildren.indexOf(this.runtimeTarget);
    },

    /**
     * Set the sibling index of this node.
     * (值越小越先渲染，-1 代表最后一个)
     *
     * @method setSiblingIndex
     * @param {number} index - new zero-based index of the node, -1 will move to the end of children.
     */
    setSiblingIndex: function (index) {
        var siblings = Fire.node(this.runtimeParent).runtimeChildren;
        var item = this.runtimeTarget;
        index = index !== -1 ? index : siblings.length - 1;
        var oldIndex = siblings.indexOf(item);
        if (index !== oldIndex) {
            siblings.splice(oldIndex, 1);
            if (index < siblings.length) {
                siblings.splice(index, 0, item);
            }
            else {
                siblings.push(item);
            }
        }
    },

    // TRANSFORM

    /**
     * Rotates this transform through point in world space by angle degrees.
     * @method rotateAround
     * @param {Fire.Vec2} point - the world point rotates through
     * @param {number} angle - degrees
     */
    rotateAround: function (point, angle) {
        var delta = this.worldPosition.subSelf(point);
        delta.rotateSelf(Math.deg2rad(angle));
        this.worldPosition = point.addSelf(delta);
        this.rotation += angle;
    },

    /**
     * Transforms position from local space to world space.
     * @method transformPointToWorld
     * @param {Vec2} point
     * @return {Vec2}
     */
    transformPointToWorld: NYI,

    /**
     * Transforms position from local space to world space.
     * @method transformPointToLocal
     * @param {Vec2} point
     * @return {Vec2}
     */
    transformPointToLocal: NYI,

    // RENDERER

    /**
     * Returns a "world" axis aligned bounding box(AABB) of the renderer.
     *
     * @method getWorldBounds
     * @param {Fire.Rect} [out] - optional, the receiving rect
     * @return {Fire.Rect} - the rect represented in world position
     */
    getWorldBounds: function (out) {
        NYI();
        return new Rect();
    },

    /**
     * Returns a "world" oriented bounding box(OBB) of the renderer.
     *
     * @method getWorldOrientedBounds
     * @param {Fire.Vec2} [out_bl] - optional, the vector to receive the world position of bottom left
     * @param {Fire.Vec2} [out_tl] - optional, the vector to receive the world position of top left
     * @param {Fire.Vec2} [out_tr] - optional, the vector to receive the world position of top right
     * @param {Fire.Vec2} [out_br] - optional, the vector to receive the world position of bottom right
     * @return {Fire.Vec2} - the array contains vectors represented in world position,
     *                    in the sequence of BottomLeft, TopLeft, TopRight, BottomRight
     */
    getWorldOrientedBounds: function (out_bl, out_tl, out_tr, out_br){
        NYI();
        return [Vec2.zero, Vec2.zero, Vec2.zero, Vec2.zero];
    }
});

/**
 * @module Fire
 */

/**
 * 返回跟 object 相互绑定的 NodeWrapper 实例，如果不存在将被创建。
 * @method node
 * @param {RuntimeNode} node
 * @return {Fire.Runtime.NodeWrapper}
 */
NodeWrapper.getWrapper = function (node) {
    if (node instanceof NodeWrapper) {
        Fire.warn('Fire.node accept argument of type runtime node, not wrapper.');
        return node;
    }
    if (!node) {
        return null;
    }
    var wrapper = node._FB_wrapper;
    if (!wrapper) {
        var Wrapper = Fire.getWrapperType(node);
        if (!Wrapper) {
            var getClassName = Fire.JS.getClassName;
            Fire.error('%s not registered for %s', getClassName(NodeWrapper), getClassName(node));
            return null;
        }
        wrapper = new Wrapper(node);
        node._FB_wrapper = wrapper;
    }
    return wrapper;
};

module.exports = NodeWrapper;
