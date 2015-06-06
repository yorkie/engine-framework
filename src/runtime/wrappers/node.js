/**
 * @module Fire.Runtime
 */

/**
 * 这个类用来封装编辑器针对节点的操作。
 * Note: 这里的接口比 Entity 更精简，只适合编辑器使用。
 *
 * You should override:
 * - name
 * - parent
 * - children
 *
 * You can override:
 * - setSiblingIndex
 *
 * @class NodeWrapper
 * @constructor
 * @param {RuntimeNode} node
 */
var NodeWrapper = Fire.Class({
    name: 'Fire.Runtime.NodeWrapper',
    constructor: function () {
        this.target = arguments[0];
        if (FIRE_EDITOR) {
            Fire.warn('target of %s must be non-nil', Fire.JS.getClassName(this));
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

        /**
         * (Need to override.)
         *
         * The parent of the node.
         * If this is the top most node in hierarchy, the returns value of Fire.node(this.parent) must be type SceneWrapper.
         * Changing the parent will keep the transform's local space position, rotation and scale the same but modify
         * the world space position, scale and rotation.
         * @property parent
         * @type {RuntimeNode}
         */
        parent: {
            get: function () {
                if (FIRE_EDITOR) {
                    Fire.error('Not yet implemented');
                }
                return null;
            },
            set: function (value) {
                if (FIRE_EDITOR) {
                    Fire.error('Not yet implemented');
                }
            }
        },

        /**
         * (Need to override.)
         *
         * Get the READ ONLY array of children.
         * @property children
         * @type {RuntimeNode[]}
         * @readOnly
         */
        children: {
            get: function () {
                if (FIRE_EDITOR) {
                    Fire.error('Not yet implemented');
                }
                return [];
            }
        }
    },

    /**
     * Set the sibling index of this node.
     *
     * @method setSiblingIndex
     * @param {number} index
     */
    setSiblingIndex: function (index) {
        var siblings = Fire.node(this.parent).children;
        var item = this;
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
    }
});
module.exports = NodeWrapper;
