/**
 * @module Fire.Runtime
 */

var JS = Fire.JS;
var Vec2 = Fire.Vec2;
var Rect = Fire.Rect;

function NYI (defVal, attrs, noSetter) {
    var prop = {
        get: function () {
            if (FIRE_EDITOR) {
                Fire.error('Not yet implemented');
            }
            return defVal;
        }
    };
    if (!noSetter) {
        prop.set = function (value) {
            if (FIRE_EDITOR) {
                Fire.error('Not yet implemented');
            }
        };
    }
    if (attrs) {
        return JS.mixin(prop, attrs);
    }
    else {
        return prop;
    }
}

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
 * - parentNode
 * - childNodes
 * - position
 * - worldPosition
 * - rotation
 * - worldRotation
 * - scale
 * - worldScale
 * - getWorldBounds
 * - getWorldOrientedBounds
 * 
 * You may want to override
 * - getSiblingIndex
 * - setSiblingIndex
 * - x
 * - y
 * - worldX
 * - worldY
 * - scaleX
 * - scaleY
 *
 * @class NodeWrapper
 * @constructor
 * @param {RuntimeNode} node
 */
var NodeWrapper = Fire.Class({
    name: 'Fire.Runtime.NodeWrapper',
    constructor: function () {
        /**
         * The target node to wrap.
         * @property target
         * @type {RuntimeNode}
         */
        this.target = arguments[0];

        if (FIRE_EDITOR && !this.target) {
            Fire.warn('target of %s must be non-nil', JS.getClassName(this));
        }
    },

    properties: {
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

        // HIERARCHY

        /**
         * The parent of the node.
         * If this is the top most node in hierarchy, the returns value of Fire.node(this.parent) must be type SceneWrapper.
         * Changing the parent will keep the transform's local space position, rotation and scale the same but modify
         * the world space position, scale and rotation.
         * @property parentNode
         * @type {RuntimeNode}
         */
        parentNode: NYI(null, INVISIBLE),

        /**
         * Returns the array of children. If no child, this method should return an empty array.
         * The returns array can be modified ONLY in setSiblingIndex.
         * @property childNodes
         * @type {RuntimeNode[]}
         * @readOnly
         */
        childNodes: NYI([], INVISIBLE, true),

        // TRANSFORM

        /**
         * The local position in its parent's coordinate system
         * @property position
         * @type {Fire.Vec2}
         */
        position: NYI(Vec2.zero),

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
        worldPosition: NYI(Vec2.zero, INVISIBLE),

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
        rotation: NYI(0, {
            tooltip: "The counterclockwise degrees of rotation relative to the parent"
        }),

        /**
         * The counterclockwise degrees of rotation in world space
         * @property worldRotation
         * @type {number}
         */
        worldRotation: NYI(0, INVISIBLE),

        /**
         * The local scale factor relative to the parent
         * @property scale
         * @type {Fire.Vec2}
         */
        scale: NYI(Vec2.one),

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
        worldScale: NYI(Vec2.one, INVISIBLE, true)
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

    /**
     * This method is called when the scene is saving, allowing you to return JSON to represent the state of your node.
     * When the scene is later loaded, the data you returned is passed to the wrapper's deserialize method so you can
     * restore the node.
     * @method serialize
     * @return {object} - a JSON represents the state of the target node
     */
    serialize: function (data) {
        if (FIRE_EDITOR) {
            Fire.error('Not yet implemented');
        }
        return null;
    },

    /**
     * @callback deserializeCallback
     * @param {string} error - null or the error info
     * @param {RuntimeNode} node - the loaded node or null
     */

    /**
     * Creates a new node using the state data from the last time the scene was serialized if the wrapper implements the serialize() method.
     * @method deserializeAsync
     * @param {object} data - the JSON data returned from serialize() method
     * @param {deserializeCallback} callback - Should not being called in current tick.
     *                                         If there's no async operation, use Fire.nextTick to simulate.
     */
    deserializeAsync: function (data, callback) {
        Fire.nextTick(callback, 'Not yet implemented', null);
    },

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
        return Fire.node(this.parentNode).childNodes.indexOf(this.target);
    },

    /**
     * Set the sibling index of this node.
     *
     * @method setSiblingIndex
     * @param {number} index
     */
    setSiblingIndex: function (index) {
        var siblings = Fire.node(this.parentNode).childNodes;
        var item = this.target;
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

    // RENDERER

    /**
     * Returns a "world" axis aligned bounding box(AABB) of the renderer.
     *
     * @method getWorldBounds
     * @param {Fire.Rect} [out] - optional, the receiving rect
     * @return {Fire.Rect} - the rect represented in world position
     */
    getWorldBounds: function (out) {
        if (FIRE_EDITOR) {
            Fire.error('Not yet implemented');
        }
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
        if (FIRE_EDITOR) {
            Fire.error('Not yet implemented');
        }
        return [Vec2.zero, Vec2.zero, Vec2.zero, Vec2.zero];
    }
});
module.exports = NodeWrapper;
