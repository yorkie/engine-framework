var JS = Fire.JS;

/**
 * @module Fire.Runtime
 */

/**
 * @class NodeWrapper
 */
var NodeWrapper = require('../wrappers/node');

var nodeProto = NodeWrapper.prototype;

/**
 * The parent of the wrapper.
 * If this is the top most node in hierarchy, its parent must be type SceneWrapper.
 * Changing the parent will keep the transform's local space position, rotation and scale the same but modify
 * the world space position, scale and rotation.
 * @property parent
 * @type {NodeWrapper}
 */
JS.getset(nodeProto, 'parent',
    function () {
        var parent = this.runtimeParent;
        return parent && Fire.node(parent);
    },
    function (value) {
        this.runtimeParent = value.runtimeTarget;
    }
);

/**
 * Returns a new array which contains wrappers of child nodes.
 * @property children
 * @type {NodeWrapper[]}
 */
JS.get(nodeProto, 'children',
    function () {
        return this.runtimeChildren.map(Fire.node);
    }
);

JS.mixin(nodeProto, {
    /**
     * Is this node an instance of Scene?
     *
     * @property isScene
     */
    isScene: false,

    /**
     * Is this wrapper a child of the parentWrapper?
     *
     * @method isChildOf
     * @param {NodeWrapper} parentWrapper
     * @return {boolean} - Returns true if this wrapper is a child, deep child or identical to the given wrapper.
     */
    isChildOf: function (parentWrapper) {
        var child = this;
        do {
            if (child === parentWrapper) {
                return true;
            }
            child = child.parent;
        }
        while (child);
        return false;
    },

    /**
     * Move the node to the top.
     *
     * @method setAsFirstSibling
     */
    setAsFirstSibling: function () {
        this.setSiblingIndex(0);
    },

    /**
     * Move the node to the bottom.
     *
     * @method setAsLastSibling
     */
    setAsLastSibling: function () {
        this.setSiblingIndex(-1);
    }
});
