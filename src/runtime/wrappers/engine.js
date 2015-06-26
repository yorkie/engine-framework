/**
 * @module Fire.Runtime
 */

var JS = Fire.JS;
var Ticker = Fire._Ticker;
var Time = Fire.Time;

var Utils = require('./utils');
var NYI = Utils.NYI;
var NYI_Accessor = Utils.NYI_Accessor;

//var SceneWrapper = require('./scene');

/**
 * !#zh 这个类用来封装编辑器对引擎的操作，并且提供运行时的一些全局接口和状态。
 * !#en Access to engine runtime data.
 * This class contains methods for looking up information about and controlling the runtime data.
 *
 * You should override:
 * - initRuntime
 * - playRuntime
 * - stopRuntime
 * - getCurrentSceneNode
 * - _setCurrentSceneNode
 * - tick (if useDefaultMainLoop)
 * - canvasSize
 *
 * @class EngineWrapper
 * @extends Playable
 * @constructor
 * @param {boolean} useDefaultMainLoop - if true, tick() will be invoked every frame
 */
var EngineWrapper = Fire.Class({
    name: 'Fire.Runtime.EngineWrapper',
    extends: Fire.Playable,

    constructor: function () {
        var useDefaultMainLoop = arguments[0];

        /**
         * We should use this id to cancel ticker, otherwise if the engine stop and replay immediately,
         * last ticker will not cancel correctly.
         *
         * @property _requestId
         * @type {number}
         * @private
         */
        this._requestId = -1;

        this._useDefaultMainLoop = useDefaultMainLoop;
        this._isInitialized = false;

        // Scene name to uuid
        this._sceneInfos = {};

        // current scene
        this._scene = null;

        this._loadingScene = '';

        this._bindedTick = useDefaultMainLoop && this._tick.bind(this);
    },

    properties: {
        /**
         * @property {boolean} isInitialized - Indicates whether the engine instance is initialized.
         * @readOnly
         */
        isInitialized: {
            get: function () {
                return this._isInitialized;
            }
        },

        /**
         * @property {boolean} loadingScene
         * @readOnly
         */
        loadingScene: {
            get: function () {
                return this._loadingScene;
            }
        },

        /**
         * @property {Fire.Vec2} canvasSize - Resize the rendering canvas.
         */
        canvasSize: NYI_Accessor(Fire.Vec2.zero)
    },

    // TO OVERRIDE

    /**
     * @callback InitCallback
     * @param {string} [error] - null or the error info
     */

    /**
     * Initialize the runtime. This method will be called by init method.
     * @method initRuntime
     * @param {object} options
     * @param {number} options.width
     * @param {number} options.height
     * @param {Canvas} [options.canvas]
     * @param {InitCallback} callback
     */
    initRuntime: function (options, callback) {
        NYI();
        callback();
    },

    /**
     * Starts playback.
     * @method playRuntime
     */
    playRuntime: NYI,

    /**
     * Stops playback.
     * @method stopRuntime
     */
    stopRuntime: NYI,

    /**
     * Get the current running scene node.
     * @method getCurrentSceneNode
     * @return {RuntimeNode}
     */
    getCurrentSceneNode: NYI,

    /**
     * Set the current running scene node.
     * @method _setCurrentSceneNode
     * @param {RuntimeNode}
     */
    _setCurrentSceneNode: NYI,

    /**
     * @method tick
     * @param {number} deltaTime
     * @param {boolean} updateLogic
     */
    tick: function (deltaTime, updateLogic) {
        NYI();

        // Example: (not required)
        if (updateLogic) {
            // update input
            // update logic
            // update particle
            // update animation
        }
        // render scene
    },

    // PUBLIC

    /**
     * Initialize the engine. This method will be called by boot.js or editor.
     * @method init
     * @param {object} options
     * @param {number} options.width
     * @param {number} options.height
     * @param {Canvas} [options.canvas]
     * @param {initCallback} callback
     */
    init: function (options, callback) {
        if (this._isInitialized) {
            Fire.error('Engine already initialized');
            return;
        }
        this._isInitialized = true;

        if (options) {
            JS.mixin(this._sceneInfos, options.scenes);
            //Resources._resBundle.init(options.resBundle);
        }

        this.initRuntime(options, function (err) {
            //if ((FIRE_EDITOR || FIRE_TEST) && !err) {
            //    //var scene = SceneWrapper.getCurrentSceneNode()
            //    //if (editorCallback.onSceneLoaded) {
            //    //    editorCallback.onSceneLoaded(this._scene);
            //    //}
            //    editorCallback.onSceneLaunched(this._scene);
            //}
            callback(err);
        });
    },

    // OVERRIDE

    onError: function (error) {
        if (FIRE_EDITOR) {
            switch (error) {
                case 'already-playing':
                    Fire.warn('Fireball is already playing');
                    break;
            }
        }
    },
    //onResume: function () {
    //    if (FIRE_EDITOR) {
    //        FObject._clearDeferredDestroyTimer();
    //        editorCallback.onEnginePlayed(true);
    //    }
    //},
    //onPause: function () {
    //    if (FIRE_EDITOR) {
    //        editorCallback.onEnginePaused();
    //    }
    //},
    onPlay: function () {
        //if (FIRE_EDITOR && ! this._isPaused) {
        //    FObject._clearDeferredDestroyTimer();
        //}

        this.playRuntime();

        if (this._useDefaultMainLoop) {
            var now = Ticker.now();
            Time._restart(now);
            this._tick();
        }

        //if (FIRE_EDITOR) {
        //    editorCallback.onEnginePlayed(false);
        //}
    },

    onStop: function () {
        //FObject._deferredDestroy();

        this.stopRuntime();

        // reset states
        this._loadingScene = ''; // TODO: what if loading scene ?

        if (this._useDefaultMainLoop) {
            if (this._requestId !== -1) {
                Ticker.cancelAnimationFrame(this._requestId);
                this._requestId = -1;
            }
        }

        //if (FIRE_EDITOR) {
        //    editorCallback.onEngineStopped();
        //}
    },

    // PRIVATE

    /**
     * @method _tick
     * @private
     */
    _tick: function (unused) {
        if (!this._isPlaying) {
            return;
        }
        this._requestId = Ticker.requestAnimationFrame(this._bindedTick);

        //if (sceneLoadingQueue) {
        //    return;
        //}

        var updateLogic = !this._isPaused || this._stepOnce;
        var now = Ticker.now();
        Time._update(now, !updateLogic, this._stepOnce ? 1 / 60 : 0);
        this._stepOnce = false;

        //if (this._scene) {
            this.tick(Time.deltaTime, updateLogic);
        //}
    }
});

JS.obsolete(EngineWrapper.prototype, 'EngineWrapper.resize', 'resizeCanvas');

module.exports = EngineWrapper;
