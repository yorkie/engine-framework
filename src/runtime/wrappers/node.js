/**
 * @module Fire.Runtime
 */

/**
 * 这个类用来封装编辑器针对节点的操作。
 * Note: 接口中包含 "Node" 的使用的都是 Runtime 的原生 Node 类型。
 *
 * You should override:
 * - name
 * - parentNode
 * - childNodes
 *
 * You can override:
 * - getSiblingIndex
 * - setSiblingIndex
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
         * The parent of the node.
         * If this is the top most node in hierarchy, the returns value of Fire.node(this.parent) must be type SceneWrapper.
         * Changing the parent will keep the transform's local space position, rotation and scale the same but modify
         * the world space position, scale and rotation.
         * @property parentNode
         * @type {RuntimeNode}
         */
        parentNode: {
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
         * Get the READ ONLY array of children.
         * @property childNodes
         * @type {RuntimeNode[]}
         * @readOnly
         */
        childNodes: {
            get: function () {
                if (FIRE_EDITOR) {
                    Fire.error('Not yet implemented');
                }
                return [];
            }
        }
    },

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
    }
});
module.exports = NodeWrapper;
