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

    strictEqual(nodeWrapper.runtimeTarget, node, 'target of wrapper');
    strictEqual(nodeWrapper.isScene, false, 'not scene');
});

test('SceneNode', function() {
    var dummyScene;
    var MyScene = Fire.Class();
    var MySceneWrapper = Fire.Class({
        extends: Fire.Runtime.SceneWrapper,
    });
    //Fire.engine.getCurrentSceneNode = function () {
    //    return dummyScene;
    //};

    Fire.Runtime.registerNodeType(MyScene, MySceneWrapper);

    dummyScene = new MyScene();
    var dummySceneWrapper = Fire.node(dummyScene);

    //strictEqual(Fire.engine.getCurrentScene(), dummySceneWrapper, 'could get current scene wrapper');

    strictEqual(dummySceneWrapper.isScene, true, 'isScene');
});

test('root', function() {
    var MyNode = Fire.Class({
        constructor: function () {
            this.parent = null;
        }
    });
    var MyNodeWrapper = Fire.Class({
        extends: Fire.Runtime.NodeWrapper,
        properties: {
            runtimeParent: {
                get: function () {
                    return this.runtimeTarget.parent;
                },
                set: function (value) {
                    this.runtimeTarget.parent = value;
                }
            }
        }
    });
    var MyScene = Fire.Class();
    var MySceneWrapper = Fire.Class({
        extends: Fire.Runtime.SceneWrapper,
    });
    Fire.Runtime.registerNodeType(MyNode, MyNodeWrapper);
    Fire.Runtime.registerNodeType(MyScene, MySceneWrapper);

    var node = new MyNode();
    var nodeWrapper = Fire.node(node);
    var node2 = new MyNode();
    var nodeWrapper2 = Fire.node(node2);
    var scene = new MyScene();
    var sceneWrapper = Fire.node(scene);

    strictEqual(nodeWrapper.root, nodeWrapper, 'root should be itself if no parent');

    node.parent = node2;
    strictEqual(nodeWrapper.root, nodeWrapper2, 'root should be parent');

    node2.parent = scene;
    strictEqual(nodeWrapper.root, sceneWrapper, 'root should be top most parent(scene)');
});
