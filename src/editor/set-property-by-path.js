
function setPropertyByPath (node, path, value) {
    if (path.indexOf('.') === -1) {
        node[path] = value;
    }
    else {
        var props = path.split('.');
        var mainPropName = props[0];
        var mainProp = node[mainPropName];
        // parse embedded props
        var subProp = mainProp;
        //if (subProp) {
            for (var i = 1; i < props.length - 1; i++) {
                var subPropName = props[i];
                subProp = subProp[subPropName];
                //if (subProp == null) {
                //}
            }
            var propName = props[props.length - 1];
            subProp[propName] = value;
            // invoke setter
            node[mainPropName] = mainProp;
        //}
        //else {
        //}
    }
}

function getPropertyByPath (node, path) {
    if (path.indexOf('.') === -1) {
        return node[path];
    }
    else {
        var props = path.split('.');
        var subProp = node;
        for (var i = 0; i < props.length; i++) {
            subProp = subProp[props[i]];
        }
        return subProp;
    }
}

function setDeepPropertyByPath (node, path, value) {
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            setPropertyByPath(node, path, value);
        }
        else {
            var obj = getPropertyByPath(node, path);
            for (var subKey in value) {
                var subVal = value[subKey];
                setDeepPropertyByPath(obj, subKey, subVal);
            }
            setPropertyByPath(node, path, obj);
        }
    }
    else {
        setPropertyByPath(node, path, value);
    }
}

Editor.setPropertyByPath = setPropertyByPath;
Editor.setDeepPropertyByPath = setDeepPropertyByPath;

module.exports = setPropertyByPath;
