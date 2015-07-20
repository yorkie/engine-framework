/**
 * @module Fire
 */

var getRuntimeChildren = function (node) {
    var wrapper = Fire.node(node);
    var runtimeChildren = wrapper.runtimeChildren;
    if (wrapper.constructor.canHaveChildrenInEditor) {
        return {
            name: wrapper.name,
            id: wrapper.id,
            children: runtimeChildren.length > 0 ? runtimeChildren.map(getRuntimeChildren) : null
        };
    }
    else {
        return {
            name: wrapper.name,
            id: wrapper.id,
            children: [],
            canHaveChildren: false
        };
    }
};

/**
 * @method getHierarchyDump
 * @return {object[]}
 */
Editor.getHierarchyDump = function () {
    var root = Fire.engine.getCurrentRuntimeScene();
    var children = Fire.node(root).runtimeChildren;
    return children.map(getRuntimeChildren);
};

module.exports = Editor.getHierarchyDump;
