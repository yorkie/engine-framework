require('../src');
require('./lib/init');

// make runtime available in core-level
Fire.Runtime = require('../src/runtime');

var PageLevel = false;
var CoreLevel = true;

describe('Editor.getNodeDump', function () {
    if (PageLevel && Fire.isEditorCore) {
        // only test in page-level
        var spawnRunner = require('./lib/spawn-runner');
        spawnRunner(this.title, __filename);
        if (!CoreLevel) {
            return;
        }
    }

    function test (object, expectedDump) {
        var dump = Editor.getNodeDump(object);
        expect(dump).to.deep.equal(expectedDump);
    }

    var node;

    before(function () {
        function Node () {}
        Node.prototype.getAge = function () {};

        var NodeWrapper = Fire.Class({
            name: 'MyNodeWrapper',
            extends: Fire.Runtime.NodeWrapper,
            properties: {
                id: {
                    get: function () {
                        return 554;
                    }
                },
                runtimeParent: {
                    get: function () {
                        return null;
                    }
                },
                runtimeChildren: {
                    get: function () {
                        return [];
                    }
                },
                position: {
                    get: function () {
                        return Fire.v2(123, 456);
                    }
                },
                worldPosition: {
                    get: function () {
                        return Fire.Vec2.zero;
                    }
                },
                rotation: {
                    get: function () {
                        return 0;
                    }
                },
                worldRotation: {
                    get: function () {
                        return 0;
                    }
                },
                scale: {
                    get: function () {
                        return Fire.Vec2.one;
                    }
                },
                worldScale: {
                    get: function () {
                        return Fire.Vec2.one;
                    }
                }
            }
        });
        Fire.Runtime.registerNodeType(Node, NodeWrapper);

        node = new Node();

        var FilterMode = Fire.defineEnum({
            Point: -1,
            Bilinear: -1,
            Trilinear: -1
        });

        var Script = Fire.Class({
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
            constructor: function () {
                this._name = 'ha';
            },
            properties: {
                name: {
                    get: function () {
                        return this._name;
                    },
                    displayName: 'Name'
                },
                wrapMode: {
                    default: FilterMode.Bilinear,
                    type: FilterMode
                },
                texture: {
                    default: null,
                    type: Fire.Texture
                }
            },
            getName: function () {
                return this.name;
            }
        });

        Fire.mixin(node, Script);
    });

    //describe('Smoke testing', function () {
    //    it('should pass if null', function () {
    //        test(null, {
    //            types: {},
    //            value: null
    //        });
    //    });
    //    it('should pass if empty', function () {
    //        test({}, {
    //            types: {},
    //            value: {}
    //        });
    //    });
    //});

    describe('dump result', function () {

        var dump;
        before(function () {
            // test wrong type
            node.texture = new Fire.Sprite();
            node.texture._uuid = '43728e743120';
            //
            dump = Editor.getNodeDump(node);
        });

        it('should contain types', function () {
            expect(dump.types).to.deep.equal({
                'MyNodeWrapper': {
                    extends: ['Fire.Runtime.NodeWrapper', 'Fire.FObject'],
                    properties: {
                        _name: {
                            visible: false
                        },
                        _objFlags: {
                            visible: false
                        },
                        runtimeChildren: {
                            visible: false
                        },
                        id: {
                            "visible": false
                        },
                        name: {},
                        runtimeParent: {
                            visible: false
                        },
                        position: {},
                        root: {},
                        rotation: {
                            tooltip: "The counterclockwise degrees of rotation relative to the parent"
                        },
                        scale: {},
                        scaleX: {
                            visible: false
                        },
                        scaleY: {
                            visible: false
                        },
                        worldPosition: {
                            visible: false
                        },
                        worldRotation: {
                            visible: false
                        },
                        worldScale: {
                            visible: false
                        },
                        worldX: {
                            visible: false
                        },
                        worldY: {
                            visible: false
                        },
                        x: {
                            visible: false
                        },
                        y: {
                            visible: false
                        },
                    }
                },
                '2154648724566': {
                    properties: {
                        age: {
                            default: 40,
                            tooltip: 'Age'
                        },
                        name: {
                            displayName: 'Name'
                        },
                        "wrapMode": {
                            "default": 1,
                            "type": "Enum",
                            "enumList": [
                                {
                                    "name": "Point",
                                    "value": 0
                                },
                                {
                                    "name": "Bilinear",
                                    "value": 1
                                },
                                {
                                    "name": "Trilinear",
                                    "value": 2
                                }
                            ]
                        },
                        texture: {
                            default: null,
                            type: 'Fire.Texture'
                        }
                    }
                }
            });
        });
        it('should contain value', function () {
            expect(dump.value).to.deep.equal({
                __type__: 'MyNodeWrapper',
                _name: '',
                name: '',
                _objFlags: 0,
                id: 554,
                runtimeChildren: null,
                runtimeParent: null,
                position: {
                    __type__: 'Fire.Vec2',
                    x: 123,
                    y: 456
                },
                rotation: 0,
                scale: {
                    __type__: 'Fire.Vec2',
                    x: 1,
                    y: 1
                },
                scaleX: 1,
                scaleY: 1,
                worldPosition: {
                    __type__: 'Fire.Vec2',
                    x: 0,
                    y: 0
                },
                worldRotation: 0,
                worldScale: {
                    __type__: 'Fire.Vec2',
                    x: 1,
                    y: 1
                },
                worldX: 0,
                worldY: 0,
                x: 123,
                y: 456,
                root: {
                    __type__: "MyNodeWrapper",
                    id: 554
                },

                __mixins__: [{
                    __type__: '2154648724566',
                    age: 40,
                    name: 'ha',
                    wrapMode: 1,
                    texture: {
                        __type__: 'Fire.Sprite',
                        uuid: node.texture._uuid
                    }
                }]
            });
        });
    });
    describe('dumpInheritanceChain', function () {
        it('should return empty array if is anonymous function', function () {
            function Node () {}
            var actual = Editor.getNodeDump.dumpInheritanceChain(Node);
            expect(actual).to.deep.equal([]);
        });
        it('should return empty array if is anonymous fire class', function () {
            var Node = Fire.Class();
            var actual = Editor.getNodeDump.dumpInheritanceChain(Node);
            expect(actual).to.deep.equal([]);
        });
        it('should not contain self class', function () {
            var Sprite = Fire.Class({
                name: 'Sprite'
            });
            var actual = Editor.getNodeDump.dumpInheritanceChain(Sprite);
            expect(actual).to.deep.equal([]);
            Fire.JS.unregisterClass(Sprite);
        });
        it('should ignore anonymous type', function () {
            var Obj = Fire.Class({
                name: 'Object',
            });
            var HashObj = Fire.Class({
                extends: Obj
            });
            var Node = Fire.Class({
                name: 'Node',
                extends: HashObj
            });
            var Sprite = Fire.Class({
                name: 'Sprite',
                extends: Node
            });
            var actual = Editor.getNodeDump.dumpInheritanceChain(Sprite);
            expect(actual).to.deep.equal(['Node', 'Object']);
            Fire.JS.unregisterClass(Sprite, Node, Obj);
        });
        it('should traversal primitive inheritance chain', function () {
            function Obj () {}
            Fire.JS.setClassName('Object', Obj);
            function HashObj () {}
            Fire.JS.extend(HashObj, Obj);
            Fire.JS.setClassName('HashObject', HashObj);
            var Node = Fire.Class({
                name: 'Node',
                extends: HashObj
            });
            var Sprite = Fire.Class({
                name: 'Sprite',
                extends: Node
            });
            var actual = Editor.getNodeDump.dumpInheritanceChain(Sprite);
            expect(actual).to.deep.equal(['Node', 'HashObject', 'Object']);
            Fire.JS.unregisterClass(Sprite, Node, HashObj, Obj);
        });
    });
});
