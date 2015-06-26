(function () {

    var currentScene;

    var MyNode,
        MyNodeWrapper,
        MyScene,
        MySceneWrapper;
    var SpriteNeedsDeferredLoad,
        TextureNeedsDeferredLoad;
    var ScriptToMix;

    function defineTypes () {
        MyNode = Fire.Class({
            constructor: function () {
                this.children = [];
                this.parent = null;
                this.color = {a:100, r:200 ,g:10, b:0};
                this.asset = arguments[0];
            }
        });
        MyNodeWrapper = Fire.Class({
            name: 'MyNodeWrapper',
            extends: Fire.Runtime.NodeWrapper,
            properties: {
                childNodes: {
                    get: function () {
                        return this.target.children;
                    }
                },
                parentNode: {
                    get: function () {
                        return this.target.parent;
                    },
                    set: function (value) {
                        if (this.target.parent) {
                            Fire.JS.Array.remove(this.target.parent.children, this.target);
                        }
                        this.target.parent = value;
                        value.children.push(this.target);
                    }
                },
                _color: {
                    default: {}
                },
                _asset: null
            },
            onBeforeSerialize: function () {
                this._color = this.target.color;
                this._asset = this.target.asset;
            },
            createNode: function () {
                var node = new MyNode(this._asset);
                node.color = this._color;
                return node;
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
            createNode: function () {
                var node = new MyScene();
                return node;
            }
        });

        Fire.Engine.getCurrentSceneNode = function () {
            return currentScene;
        };

        Fire.Runtime.registerNodeType(MyNode, MyNodeWrapper);
        Fire.Runtime.registerNodeType(MyScene, MySceneWrapper);
        currentScene = new MyScene();

        SpriteNeedsDeferredLoad = Fire.Class({
            name: 'Test.SpriteNeedsDeferredLoad',
            extends: Fire.Asset,
            properties: {
                pivot: {
                    default: new Fire.Vec2(0.5, 0.5),
                    tooltip: 'The pivot is normalized, like a percentage.\n' +
                             '(0,0) means the bottom-left corner and (1,1) means the top-right corner.\n' +
                             'But you can use values higher than (1,1) and lower than (0,0) too.'
                },
                trimX: {
                    default: 0,
                    type: Fire.Integer
                },
                trimY: {
                    default: 0,
                    type: Fire.Integer
                },
                width: {
                    default: 0,
                    type: Fire.Integer
                },
                height: {
                    default: 0,
                    type: Fire.Integer
                },
                texture: {
                    default: null,
                    type: Fire.Texture,
                    visible: false
                },
                rotated: {
                    default: false,
                    visible: false
                },
                x: {
                    default: 0,
                    type: Fire.Integer,
                    visible: false
                },
                y: {
                    default: 0,
                    type: Fire.Integer,
                    visible: false
                }
            }
        });

        TextureNeedsDeferredLoad = Fire.Class({
            name: 'Test.TextureNeedsDeferredLoad',
            extends: Fire.Asset,
            properties: {
                image: {
                    default: null,
                    visible: false
                },
                width: {
                    default: 0,
                    type: Fire.Integer,
                    readonly: true
                },
                height: {
                    default: 0,
                    type: Fire.Integer,
                    readonly: true
                }
            }
        });

        ScriptToMix = Fire.Class({
            name: '2154648724566',
            extends: Fire.Class({
                constructor: function () {
                    this.realAge = 30;
                },
                properties: {
                    age: {
                        default: 40,
                        tooltip: 'Age'
                    }
                },
                getAge: function () {
                    return this.age;
                }
            }),
            properties: {
                name: {
                    get: function () {
                        return this._name;
                    },
                    displayName: 'Name'
                },
                target: {
                    default: null,
                    type: MyNodeWrapper
                }
            },
            getName: function () {
                return this.name;
            }
        });
    }

    module('test scene serialization', {
        setup: function () {
            SetupEngine.setup();
            defineTypes();
        },
        teardown: function () {
            Fire.JS.unregisterClass(MySceneWrapper, MyNodeWrapper, SpriteNeedsDeferredLoad, TextureNeedsDeferredLoad,
                ScriptToMix);
            SetupEngine.teardown();
        }
    });

    var assetDir = '../assets';
    var projPath = assetDir;
    var libPath = projPath + '/library/deferred-loading';

    var grossini_uuid = '748321';
    var grossiniSprite_uuid = '1232218';

    asyncTest('serialize scene', function () {
        AssetLibrary.init(libPath);
        AssetLibrary.loadAsset(grossiniSprite_uuid, function (err, asset) {
            var sprite = asset;
            var texture = sprite.texture;

            var wrapper = Fire.Engine.getCurrentScene();
            var actual = Editor.serialize(wrapper, {stringify: false});
            var expect = {
                "__type__": "MySceneWrapper",
                "content": []
            };
            deepEqual(actual, expect, 'serializing empty scene');

            var node1 = new MyNode();
            node1.parent = wrapper.target;
            node1.color = {r: 123, g: 0, b: 255, a: 255};
            node1.asset = sprite;
            wrapper.target.children.push(node1);

            var node2 = new MyNode();
            node2.parent = node1;
            node2.color = {r: 321, g: 250, b: 250, a: 0};
            node2.asset = texture;
            node1.children.push(node2);

            Fire.mixin(node1, ScriptToMix);
            node1.age = 30;
            node1.target = Fire.node(node2);

            actual = Editor.serialize(wrapper, {stringify: false});
            expect = {
                "__type__": "MySceneWrapper",
                "content": [
                    [
                        {
                            "c": [
                                {
                                    "c": undefined,
                                    "m": undefined,
                                    "t": undefined,
                                    "w": {
                                        "__id__": 2
                                    }
                                }
                            ],
                            "m": Fire.JS._getClassId(ScriptToMix),
                            "t": {
                                "__id__": 3
                            },
                            "w": {
                                "__id__": 1
                            }
                        }
                    ],
                    {
                        "__type__": "MyNodeWrapper",
                        _color: node1.color,
                        _asset: {
                            __uuid__: node1.asset._uuid
                        },
                        "_name": "",
                        "_objFlags": 0
                    },
                    {
                        "__type__": "MyNodeWrapper",
                        _color: node2.color,
                        _asset: {
                            __uuid__: node2.asset._uuid
                        },
                        "_name": "",
                        "_objFlags": 0
                    },
                    {
                        "_name": "",
                        "_objFlags": 0,
                        "age": 30,
                        "target": {
                            "__id__": 2
                        }
                    }
                ]
            };
            deepEqual(actual, expect, 'serializing non-empty scene');

            var loaded = Fire.deserialize(actual);

            loaded.preloadAssets = new Callback(function (assets, callback) {
                strictEqual(assets.length, 2, 'scene wrapper should preload 2 assets');
                if (assets[0]._uuid === sprite._uuid && assets[1]._uuid === texture._uuid) {
                    ok(true, 'checking preload assets');
                }
                else {
                    var res = assets[1]._uuid === sprite._uuid && assets[0]._uuid === texture._uuid;
                    ok(res, 'checking preload assets');
                }
                callback();
            }).enable();

            loaded.create(function () {
                loaded.preloadAssets.once('should call preloadAssets');

                strictEqual(loaded.constructor, MySceneWrapper, 'loaded scene should be MySceneWrapper');
                strictEqual(loaded.childNodes.length, 1, 'loaded scene should have 1 child');
                strictEqual(loaded.parentNode, null, 'loaded scene should have no parent');

                var rootNode = loaded.childNodes[0];
                strictEqual(rootNode.constructor, MyNode, 'root node should be MyNode');
                deepEqual(rootNode.color, node1.color, 'color of root node should equals to node1');
                strictEqual(rootNode.asset._uuid, sprite._uuid, 'asset of root node should equals to sprite');
                strictEqual(Fire.node(rootNode).childNodes.length, 1, 'root node should have 1 child');
                strictEqual(Fire.node(rootNode).parent, loaded, 'parent of root node should be scene');

                var childNode = Fire.node(rootNode).childNodes[0];
                deepEqual(childNode.color, node2.color, 'color of child node should equals to node2');
                strictEqual(childNode.asset._uuid, texture._uuid, 'asset of child node should equals to texture');
                strictEqual(Fire.node(childNode).childNodes.length, 0, 'child node should have no child');
                strictEqual(Fire.node(childNode).parentNode, rootNode, 'parent of child node should be root node');

                strictEqual(rootNode.asset.texture, childNode.asset, 'references of the same asset should be equal');

                // TEST MIXIN

                strictEqual(rootNode.getName, ScriptToMix.prototype.getName, 'should mixin methods');
                strictEqual(rootNode.age, 30, 'should deserialize mixin');
                //ok(rootNode.target === childNode, 'should restore node references in mixin');
                ok(rootNode.target === Fire.node(childNode), 'should restore wrapper references in mixin');

                start();
            });
        });
    });

})();
