module('wrapper');

test('Node', function() {
    var MyNode = Fire.Class();
    var MyNodeWrapper = Fire.Class({
        extends: Fire.Runtime.NodeWrapper,
        statics: {
        }
    });
    Fire.Runtime.registerNodeType(MyNode, MyNodeWrapper);

    var node = new MyNode();
    var nodeWrapper = Fire.node(node);

    strictEqual(nodeWrapper.target, node, 'target of wrapper');
    strictEqual(nodeWrapper.isScene, false, 'not scene');
});

test('SceneNode', function() {
    var dummyScene;
    var MyScene = Fire.Class();
    var MySceneWrapper = Fire.Class({
        extends: Fire.Runtime.SceneWrapper,
    });
    //Fire.Engine.getCurrentSceneNode = function () {
    //    return dummyScene;
    //};

    Fire.Runtime.registerNodeType(MyScene, MySceneWrapper);

    dummyScene = new MyScene();
    var dummySceneWrapper = Fire.node(dummyScene);

    //strictEqual(Fire.Engine.getCurrentScene(), dummySceneWrapper, 'could get current scene wrapper');

    strictEqual(dummySceneWrapper.isScene, true, 'isScene');
});
