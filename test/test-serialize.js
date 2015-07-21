﻿require('../src');
require('./lib/init');

describe('Serialize', function () {

    function match (obj, expected, info) {
        it (info, function () {
            var actual = JSON.parse(Editor.serialize(obj));
            expect(actual).to.deep.equal(expected);
        });
    }

    describe('basic test', function() {
        match({}, {}, 'smoke test1');
        match([], [[]], 'smoke test2');

        var BaseAsset = function () {
            this.inheritProp = 321;
        };

        var MyAsset = (function () {
            var _super = BaseAsset;

            function MyAsset () {
                _super.call(this);

                this.emptyArray = [];
                this.array = [1, '2', {a:3}, [4, [5]], true];
                this.string = 'unknown';
                this.number = 1;
                this.boolean = true;
                this.emptyObj = {};
                this.obj = {};
            }
            Fire.JS.extend(MyAsset, _super);
            Fire.JS.setClassName('MyAsset', MyAsset);

            // should not serialize ----------------------------
            MyAsset.staticFunc = function () { };
            MyAsset.staticProp = Fire.defineEnum({
                UseBest: -1,
                Ascending: -1,
                Descending: -1
            });
            MyAsset.prototype.protoFunc = function () { };
            MyAsset.prototype.protoProp = 123;
            // -------------------------------------------------

            return MyAsset;
        })();
        var asset = new MyAsset();
        asset.dynamicProp = false;

        var expect = {
            __type__: 'MyAsset',
            emptyArray: [],
            array: [1, '2',  {a:3}, [4, [5]], true],
            string: 'unknown',
            number: 1,
            boolean: true,
            emptyObj: {},
            obj: {},
            dynamicProp: false,
            inheritProp: 321
        };

        match(asset, expect, 'type test');
        match(asset, expect, 'test re-serialize again');

        Fire.JS.unregisterClass(MyAsset);
    });

    describe('nil', function () {
        var obj = {
            'null': null,
            'undefined': undefined,
        };
        var expect = {
            'null': null
        };
        match(obj, expect);
    });

    describe('test inherited FireClass', function() {
        var MyAsset = Fire.extend('MyAsset', Fire.Asset, function () {
            this.array = [1, '2', {a:3}, [4, [5]], true];
        });
        MyAsset.prop('emptyArray', [])
            .prop('array', null)
            .prop('string', 'unknown')
            .prop('number', 1)
            .prop('boolean', true)
            .prop('emptyObj', {})
            .prop('obj', {});

        // should not serialize ----------------------------
        MyAsset.staticFunc = function () { };
        MyAsset.staticProp = Fire.defineEnum({
            UseBest: -1,
            Ascending: -1,
            Descending: -1
        });
        MyAsset.prototype.protoFunc = function () { };
        MyAsset.prototype.protoProp = 123;
        // -------------------------------------------------

        var asset = new MyAsset();
        asset.dynamicProp = false;  // should not serialize
        asset._objFlags |= Fire._ObjectFlags.Destroying;   // should not serialize

        var expect = {
            __type__: 'MyAsset',
            _objFlags: 0,
            _name: '',
            _rawFiles: null,
            emptyArray: [],
            array: [1, '2',  {a:3}, [4, [5]], true],
            string: 'unknown',
            number: 1,
            boolean: true,
            emptyObj: {},
            obj: {}
        };

        match(asset, expect, 'test');

        Fire.JS.unregisterClass(MyAsset);
    });

    describe('test FireClass', function () {
        var Sprite = Fire.define('Sprite', function () {
            this.image = 'sprite.png';
        });
        Sprite.prop('size', new Fire.Vec2(128, 128));

        var sprite = new Sprite();
        var actual = JSON.parse(Editor.serialize(sprite));

        it('should not serialize variable which not defined by property', function () {
            expect(actual.image).to.equal(undefined);
        });

        var expected = {
            __type__: 'Sprite',
            size: {
                __type__: "Fire.Vec2",
                x: 128,
                y: 128
            }
        };

        it('can serialize', function () {
            expect(actual).to.deep.equal(expected);
        });

        Fire.JS.unregisterClass(Sprite);
    });

    describe('test circular reference', function () {
        function MyAsset () {
            this.array1 = [1];
            this.array2 = [this.array1, 2];
            this.array1.push(this.array2);
            // array1 = [1, array2]
            // array2 = [array1, 2]

            this.dict1 = {num: 1};
            this.dict2 = {num: 2, other: this.dict1};
            this.dict1.other = this.dict2;
        }
        var asset = new MyAsset();

        var expect = [
            {
                array1: { __id__: 1 },
                array2: [ { __id__: 1 },  2 ],
                dict1: { __id__: 2 },
                dict2: { /*__id__: 4,*/ num:2, other: {__id__: 2} },
            },
            [ 1,  [{ __id__: 1 }, 2] ],  // You'll get two copies of array2
            { /*__id__: 2,*/ num:1, other: {num:2, other: {__id__: 2}} },  // You'll get two copies of dict2
        ];
        match(asset, expect, 'arrays and dicts can circular reference each other');
        match(asset, expect, 'test re-serialize again');
    });

    describe('test serializable attributes', function () {
        var Sprite = Fire.define('Sprite')
            .prop('trimThreshold', 2, Fire.EditorOnly)
            .prop('_isValid', true, Fire.NonSerialized);

        var sprite = new Sprite();
        var resultInEditor = JSON.parse(Editor.serialize(sprite));
        var resultInPlayer = JSON.parse(Editor.serialize(sprite, { exporting: true }));

        it ('serialize editor only in editor', function () {
            expect(resultInEditor.trimThreshold).to.equal(2);
        });
        it ('should not serialize editor only in player', function () {
            expect(resultInPlayer.trimThreshold).to.equal(undefined);
        });

        it ('should not serialize non-serialized in editor', function () {
            expect(resultInEditor._isValid).to.equal(undefined);
        });
        it ('should not serialize non-serialized in player', function () {
            expect(resultInPlayer._isValid).to.equal(undefined);
        });

        Fire.JS.unregisterClass(Sprite);
    });

    describe('test asset property', function () {
        var sprite = new Fire.Sprite();
        sprite.texture = new Fire.Texture();
        var uuid = '541020432560';
        sprite.texture._uuid = uuid;

        var result = JSON.parse(Editor.serialize(sprite));

        it('serialize asset as uuid reference', function () {
            expect(result.texture).to.deep.equal({__uuid__: uuid});
        });
    });

    describe('test FObject reference', function () {
        var fobj = new Fire.FObject();
        var asset = { ref1: fobj, ref2: fobj };
        var expected = [
            {
                "ref1": { "__id__": 1 },
                "ref2": { "__id__": 1 }
            },
            { "__type__": "Fire.FObject", "_objFlags": 0, "_name": "" },
        ];
        match(asset, expected, 'references should the same');
    });

    describe('main asset', function () {
        var Scene = Fire.Class({
            name: "Scene",
            properties: {
                entities: [],
            }
        });

        var Entity = Fire.Class({
            name: "Entity"
        });

        var scene = new Scene();
        scene.entities.push(new Entity());

        var expected = [
            {
                "__type__": "Scene",
                "entities": [
                    {
                        "__id__": 1
                    }
                ]
            },
            {
                "__type__": "Entity"
            }
        ];

        match(scene, expected, 'main asset should listed first');

        Fire.JS.unregisterClass(Scene, Entity);
    });

    describe('nicify', function () {
        var data = [
            {
                "ref1": [1, 2, 3, { "__id__": 1 }, { "a": 1, "b": 2, "c": { "__id__": 2 } }],
                "ref2": { "__id__": 1 },
                "ref3": { "__id__": 3 },
                "ref4": { "__id__": 3 },
                "ref5": [{ "__id__": 4 }, { "__id__": 4 }]
            },
            { "__type__": "Fire.FObject", "_name": "test_1", "_objFlags": 0 },
            { "__type__": "Fire.FObject", "_name": "test_2", "_objFlags": 0 },
            { "__type__": "Fire.FObject", "_name": "test_3", "_objFlags": 0 },
            { "__type__": "Fire.FObject", "_name": "test_4", "_objFlags": 0 }
        ];
        var expected = [
            {
                "ref1": [1, 2, 3, { "__id__": 1 }, { "a": 1, "b": 2, "c": { "__type__": "Fire.FObject", "_name": "test_2", "_objFlags": 0 } }],
                "ref2": { "__id__": 1 },
                "ref3": { "__id__": 2 },
                "ref4": { "__id__": 2 },
                "ref5": [{ "__id__": 3 }, { "__id__": 3 }]
            },
            { "__type__": "Fire.FObject", "_name": "test_1", "_objFlags": 0 },
            { "__type__": "Fire.FObject", "_name": "test_3", "_objFlags": 0 },
            { "__type__": "Fire.FObject", "_name": "test_4", "_objFlags": 0 }
        ];

        it('should success', function () {
            Fire._nicifySerialized(data);
            expect(data).to.deep.equal(expected);
        });
    });

    describe('nicify 1', function () {
        var data = [
            {
                "ref1": { "__id__": 1 }
            },
            {
                "ref2": { "__id__": 2 },
            },
            {
                "ref3": { "__id__": 3 },
            },
            {
                "123": 1,
            },
        ];

        var expected = [
            {
                "ref1": { "ref2": { "ref3": { "123": 1 } }}
            },
        ];

        it('should success', function () {
            Fire._nicifySerialized(data);
            expect(data).to.deep.equal(expected);
        });
    });

    describe('nicify 2', function () {
        var data = [
            {
                "ref1": { "__id__": 1 }
            },
            {
                "ref0": { "__id__": 0 },
            },
        ];

        var expected = [
            {
                "ref1": { "ref0": { "__id__": 0 } }
            },
        ];

        it('should success', function () {
            Fire._nicifySerialized(data);
            expect(data).to.deep.equal(expected);
        });
    });

    if (Fire.isEditorCore) {
        // test in page-level
        var spawnRunner = require('./lib/spawn-runner');
        spawnRunner(this.title, __filename);
    }
});
