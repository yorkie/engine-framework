(function () {

    var currentScene;

    var MyNode,
        MyNodeWrapper,
        MyScene,
        MySceneWrapper;

    module('test scene serialization', {
        setup: function () {
            SetupEngine.setup();

            MyNode = Fire.Class({
                constructor: function () {
                    this.children = [];
                    this.parent = null;
                }
            });
            MyNodeWrapper = Fire.Class({
                extends: Fire.Runtime.NodeWrapper,
                properties: {
                    childNodes: {
                        get: function () {
                            return this.target.children;
                        }
                    },
                    parent: {
                        get: function () {
                            return this.target.parent;
                        }
                    }
                }
            });

            MyScene = Fire.Class({
                extends: MyNode
            });
            MySceneWrapper = Fire.Class({
                name: 'MySceneWrapper',
                extends: Fire.Runtime.SceneWrapper,
                properties: {
                    childNodes: {
                        get: function () {
                            return this.target.children;
                        }
                    }
                },
                statics: {
                    getCurrentSceneNode: function () {
                        return currentScene;
                    }
                }
            });

            Fire.Runtime.registerNodeType(MyNode, MyNodeWrapper);
            Fire.Runtime.registerNodeType(MyScene, MySceneWrapper);
            currentScene = new MyScene();
        },
        teardown: function () {
            Fire.JS.unregisterClass(MySceneWrapper);
            SetupEngine.teardown();
        }
    });

    test('serialize scene', function () {
        var wrapper = Fire.SceneWrapperImpl.getCurrentScene();
        var actual = Editor.serialize(wrapper, {stringify: false});
        var expect = {
            "__type__": "MySceneWrapper",
            "content": {
                "mixins": null,
                "wrappers": []
            }
        };
        deepEqual(actual, expect, 'serializing empty scene');

        var node1 = new MyNode();
        node1.parent = wrapper.target;
        wrapper.target.children.push(node1);
        var node2 = new MyNode();
        node2.parent = node1;
        node1.children.push(node2);

        actual = Editor.serialize(wrapper, {stringify: false});
        expect = {
            "__type__": "MySceneWrapper",
            "content": [
                {
                    "mixins": null,
                    "wrappers": [
                        {
                            "c": [
                                {
                                    "w": {
                                        "__id__": 2
                                    }
                                }
                            ],
                            "w": {
                                "__id__": 1
                            }
                        }
                    ]
                },
                {
                    "_name": "",
                    "_objFlags": 0
                },
                {
                    "_name": "",
                    "_objFlags": 0
                }
            ]
        };
        deepEqual(actual, expect, 'serializing non-empty scene');

    });

})();
