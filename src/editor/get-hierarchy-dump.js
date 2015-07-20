/**
 * @module Fire
 */

var getchildrenN = function (node) {
    var wrapper = Fire(node);
    var childrenN = wrapper.childrenN;
    if (wrapper.constructor.canHaveChildrenInEditor) {
        return {
            name: wrapper.name,
            id: wrapper.id,
            children: childrenN.length > 0 ? childrenN.map(getchildrenN) : null
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
    var root = Fire.engine.getCurrentSceneN();
    var children = Fire(root).childrenN;
    return children.map(getchildrenN);
};

module.exports = Editor.getHierarchyDump;
