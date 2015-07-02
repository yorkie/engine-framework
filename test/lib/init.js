// platform definition

Fire.isUnitTest = true;

// shortcuts

var FObject = Fire.FObject;
//var Asset = Fire.Asset;
var Vec2 = Fire.Vec2;
var Matrix23 = Fire.Matrix23;
var Rect = Fire.Rect;
var Color = Fire.Color;
//var Texture = Fire.Texture;
//var Sprite = Fire.Sprite;
//var Atlas = Fire.Atlas;
//var FontInfo = Fire.FontInfo;

//var TestOnly = Fire.__TESTONLY__;
var Ticker = Fire._Ticker;
var Time = Fire.Time;
//var Entity = Fire.Entity;
//var Engine = Fire.engine;
//var Camera = Fire.Camera;
//var Component = Fire.Component;
var LoadManager = Fire.LoadManager;
var AssetLibrary = Fire.AssetLibrary;
//var SpriteRenderer = Fire.SpriteRenderer;
//var Screen = Fire.Screen;

var FO = Fire.FObject;
var V2 = Fire.Vec2;
var v2 = Fire.v2;
var color = Fire.color;
var M3 = Fire.Matrix23;

if (!Fire.Sprite) {
    var Sprite = (function () {
        var Sprite = Fire.Class({
            name: 'Fire.Sprite',
            extends: Fire.Asset,
            constructor: function () {
                var img = arguments[0];
                if (img) {
                    this.texture = new Fire.Texture(img);
                    this.width = img.width;
                    this.height = img.height;
                }
            },
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
                },
                rawWidth: {
                    default: 0,
                    type: Fire.Integer,
                    visible: false
                },
                rawHeight: {
                    default: 0,
                    type: Fire.Integer,
                    visible: false
                },
                pixelLevelHitTest: {
                    default: false,
                    tooltip: 'Use pixel-level hit testing.'
                },
                alphaThreshold: {
                    default: 0.1,
                    tooltip: 'The highest alpha channel value that is considered opaque for hit test.',
                    watch: {
                        'pixelLevelHitTest': function (obj, propEL) {
                            propEL.disabled = !obj.pixelLevelHitTest;
                        }
                    }
                },
                borderTop: {
                    default: 0,
                    type: Fire.Integer
                },
                borderBottom: {
                    default: 0,
                    type: Fire.Integer
                },
                borderLeft: {
                    default: 0,
                    type: Fire.Integer
                },
                borderRight: {
                    default: 0,
                    type: Fire.Integer
                }
            }
        });

        return Sprite;
    })();

    Fire.Sprite = Sprite;

    Fire.JS.get(Sprite.prototype, 'rotatedWidth', function () {
        return this.rotated ? this.height : this.width;
    });

    Fire.JS.get(Sprite.prototype, 'rotatedHeight', function () {
        return this.rotated ? this.width : this.height;
    });
}

if (!Fire.Texture) {
    var Texture = (function () {
        var WrapMode = Fire.defineEnum({
            Repeat: -1,
            Clamp: -1
        });
        var FilterMode = Fire.defineEnum({
            Point: -1,
            Bilinear: -1,
            Trilinear: -1
        });
        var Texture = Fire.Class({
            name: 'Fire.Texture',
            extends: Fire.Asset,
            constructor: function () {
                var img = arguments[0];
                if (img) {
                    this.image = img;
                    this.width = img.width;
                    this.height = img.height;
                }
            },
            properties: {
                image: {
                    default: null,
                    rawType: 'image',
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
                },
                wrapMode: {
                    default: WrapMode.Clamp,
                    type: WrapMode,
                    readonly: true
                },
                filterMode: {
                    default: FilterMode.Bilinear,
                    type: FilterMode,
                    readonly: true
                }
            },
        });

        Texture.WrapMode = WrapMode;
        Texture.FilterMode = FilterMode;

        return Texture;
    })();
    Fire.Texture = Texture;

}

if (Fire.isWeb) {
    var EngineWrapper = Fire.Class({
        extends: Fire.Runtime.EngineWrapper,
        initRuntime: function () {},
        playRuntime: function () {},
        stopRuntime: function () {},
        tick: function () {}
    });
    Fire.Runtime.registerEngine(new EngineWrapper(true));

    var Engine = Fire.engine;
    Engine._reset = function (w, h) {
        if (!Engine.isInitialized) {
            Engine.init({
                width: w,
                height: h
            });
        }
        //else {
        //    Screen.size = new V2(w, h);
        //}
        //Engine._launchScene(new Fire._Scene());

        Engine.stop();
    };

    var SetupEngine = {
        setup: function () {
            Engine.tick = function () {};
            Engine._reset(256, 512);
            //// check error
            //Engine._renderContext.checkMatchCurrentScene(true);
        },
        teardown: function () {
            Engine.tick = function () {};
            //Engine._launchScene(new Fire._Scene());
            Engine.stop();
            //// check error
            //Engine._renderContext.checkMatchCurrentScene(true);
        }
    };

    // force stop to ensure start will only called once
    function asyncEnd () {
        Engine.stop();
        Engine.tick = function () {};
        start();
    }
}
