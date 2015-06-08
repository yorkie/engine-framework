// 这里提供一些辅助 api

/**
 * @module Fire.Runtime
 */
/**
 * @class NodeWrapper
 */
var NodeWrapper = require('./wrappers/node');

Fire.JS.mixin(NodeWrapper.prototype, {

    /**
     * The parent of the wrapper.
     * If this is the top most node in hierarchy, its parent must be type SceneWrapper.
     * Changing the parent will keep the transform's local space position, rotation and scale the same but modify
     * the world space position, scale and rotation.
     * @property parent
     * @type {NodeWrapper}
     */
    parent: {
        get: function () {
            var parent = this.parentNode;
            return parent && Fire.node(parent);
        },
        set: function (value) {
            this.parentNode = value.target;
        }
    },

    /**
     * Returns a new array which contains wrappers of child nodes.
     * @property children
     * @type {NodeWrapper[]}
     */
    children: {
        get: function () {
            return this.childNodes.map(Fire.node);
        }
    },

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

/**
 * @class SceneWrapper
 */
var SceneWrapper = require('./wrappers/scene');

/**
 * Get the current running scene.
 * @method getCurrentScene
 * @return {SceneWrapper}
 * @static
 */
SceneWrapper.getCurrentScene = function () {
    return Fire.node(Fire.SceneWrapperImpl.getCurrentSceneNode());
};

/**
 * @module Fire
 */

function getChildNodes (node) {
    var wrapper = Fire.node(node);
    var childNodes = wrapper.childNodes;
    return {
        name: wrapper.name,
        children: childNodes.length > 0 ? wrapper.childNodes.map(getChildNodes) : null
    };
}

/**
 * @method takeHierarchySnapshot
 * @return {object[]}
 */
Fire.takeHierarchySnapshot = function () {
    var root = register.getRegisteredSceneWrapper().getCurrentSceneNode();
    var children = Fire.node(root).childNodes;
    return children.map(getChildNodes);
};
