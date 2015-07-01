require('../src');
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
                parentNode: {
                    get: function () {
                        return null;
                    }
                },
                childNodes: {
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
            dump = Editor.getNodeDump(node);
        });

        it('should contain types', function () {
            expect(dump.types).to.deep.equal({
                'MyNodeWrapper': {
                    properties: {
                        _name: {
                            visible: false
                        },
                        _objFlags: {
                            visible: false
                        },
                        childNodes: {
                            visible: false
                        },
                        id: {
                            "visible": false
                        },
                        name: {},
                        parentNode: {
                            visible: false
                        },
                        position: {},
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
                        _name: {
                            visible: false
                        },
                        _objFlags: {
                            visible: false
                        },
                        age: {
                            default: 40,
                            tooltip: 'Age'
                        },
                        name: {
                            displayName: 'Name'
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
                childNodes: null,
                parentNode: null,
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

                __mixins__: [{
                    __type__: '2154648724566',
                    _name: 'ha',
                    _objFlags: 0,
                    age: 40,
                    name: 'ha'
                }]
            });
        });
    });
});
