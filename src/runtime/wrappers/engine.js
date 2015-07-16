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
 * - pauseRuntime
 * - resumeRuntime
 * - updateRuntime
 * - animateRuntime
 * - renderRuntime
 * - getCurrentRuntimeScene
 * - _setCurrentRuntimeScene
 * - canvasSize
 * - getRuntimeInstanceById
 * - getIntersectionList
 *
 * You may want to override:
 * - tick (if useDefaultMainLoop)
 * - tickInEditMode
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

        this._bindedTick = (FIRE_EDITOR || useDefaultMainLoop) && this._tick.bind(this);

        // states
        this._isCloning = false;    // deserializing or instantiating
        //this._isLockingScene = false;

        if (FIRE_EDITOR) {
            /**
             * The maximum value the Time.deltaTime in edit mode.
             * @property maxDeltaTimeInEM
             * @type {Number}
             * @private
             */
            this.maxDeltaTimeInEM = 1 / 30;
            /**
             * Is playing animation in edit mode.
             * @property animatingInEditMode
             * @type {Boolean}
             * @private
             */
            this.animatingInEditMode = false;

            this._shouldRepaintInEM = false;
            this._forceRepaintId = -1;
        }
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
        canvasSize: NYI_Accessor(Fire.Vec2.zero),

        /**
         * The interval(ms) every time the engine force to repaint the scene in edit mode.
         * If don't need, set this to 0.
         * @property forceRepaintIntervalInEM
         * @type {Number}
         * @private
         */
        forceRepaintIntervalInEM: {
            default: 500,
            notify: FIRE_EDITOR && function () {
                if (this._forceRepaintId !== -1) {
                    clearInterval(this._forceRepaintId);
                }
                if (this.forceRepaintIntervalInEM > 0) {
                    var self = this;
                    this._forceRepaintId = setInterval(function () {
                        self.repaintInEditMode();
                    }, this.forceRepaintIntervalInEM);
                }
            }
        }
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
     * Pauses playback.
     * @method pauseRuntime
     */
    pauseRuntime: NYI,
    /**
     * Resumes playback.
     * @method resumeRuntime
     */
    resumeRuntime: NYI,

    /**
     * Update phase, will not invoked in edit mode.
     * Use this method to update your engine logic, such as input logic and game logic.
     * @method updateRuntime
     */
    updateRuntime: NYI,
    /**
     * Animate phase, called after updateRuntime.
     * Use this method to update your particle and animation.
     * @method animateRuntime
     */
    animateRuntime: NYI,
    /**
     * Render phase, called after animateRuntime.
     * Use this method to render your scene.
     * @method renderRuntime
     */
    renderRuntime: NYI,

    ///**
    // * Steps playback.
    // * @method stepRuntime
    // */
    //stepRuntime: NYI,

    /**
     * Get the current running runtime scene.
     * @method getCurrentRuntimeScene
     * @return {RuntimeNode}
     */
    getCurrentRuntimeScene: NYI,

    /**
     * Set the current running runtime scene.
     * @method _setCurrentRuntimeScene
     * @param {RuntimeNode}
     */
    _setCurrentRuntimeScene: NYI,

    /**
     * Returns the node which id is id.
     * @method getRuntimeInstanceById
     * @param {String} id
     * @return {Object}
     */
    getRuntimeInstanceById: NYI,

    /**
     * This method will be invoke only if useDefaultMainLoop is true.
     * @method tick
     * @param {number} deltaTime
     * @param {boolean} updateLogic
     */
    tick: function (deltaTime, updateLogic) {
        if (updateLogic) {
            this.updateRuntime(deltaTime);
            this.animateRuntime(deltaTime);
        }
        this.renderRuntime();
    },

    /**
     * This method will be invoked in edit mode even if useDefaultMainLoop is false.
     * @method tickInEditMode
     * @param {number} deltaTime
     * @param {boolean} updateAnimate
     */
    tickInEditMode: function (deltaTime, updateAnimate) {
        if (FIRE_EDITOR) {
            if (updateAnimate) {
                this.animateRuntime(deltaTime);
            }
            this.renderRuntime();
        }
    },

    /**
     * Pick nodes that lie within a specified screen rectangle.
     * @method getIntersectionList
     * @param {Rect} rect - An rectangle specified with world coordinates.
     * @return {RuntimeNode[]}
     */
    getIntersectionList: NYI,

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

        var self = this;

        this.initRuntime(options, function (err) {
            if (!err) {
                if (FIRE_EDITOR && Editor.isPageLevel) {
                    var Register = require('../register');
                    Register.registerToCoreLevel();
                }
                //var scene = SceneWrapper.getCurrentRuntimeScene()
                //if (editorCallback.onSceneLoaded) {
                //    editorCallback.onSceneLoaded(this._scene);
                //}
            }
            callback(err);

            if (FIRE_EDITOR) {
                // start main loop for editor after initialized
                self._tickStart();
                // start timer to force repaint the scene in edit mode
                self.forceRepaintIntervalInEM = self.forceRepaintIntervalInEM;
            }
        });
    },

    repaintInEditMode: function () {
        if (FIRE_EDITOR && !this._isUpdating) {
            this._shouldRepaintInEM = true;
        }
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
    onResume: function () {
        // if (FIRE_EDITOR) {
        //     FObject._clearDeferredDestroyTimer();
        //     editorCallback.onEnginePlayed(true);
        // }
        this.resumeRuntime();

        if (FIRE_EDITOR && !this._useDefaultMainLoop) {
            this._tickStop();
        }
    },
    onPause: function () {
        // if (FIRE_EDITOR) {
        //     editorCallback.onEnginePaused();
        // }
        this.pauseRuntime();

        if (FIRE_EDITOR) {
            // start tick for edit mode
            this._tickStart();
        }
    },
    onPlay: function () {
        //if (FIRE_EDITOR && ! this._isPaused) {
        //    FObject._clearDeferredDestroyTimer();
        //}

        this.playRuntime();

        this._shouldRepaintInEM = false;
        if (this._useDefaultMainLoop) {
            // reset timer for default main loop
            var now = Ticker.now();
            Time._restart(now);
            //
            if (FIRE_EDITOR) {
                this._tickStart();
            }
        }
        else if (FIRE_EDITOR) {
            // dont tick in play mode
            this._tickStop();
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

        if (FIRE_EDITOR) {
            // start tick for edit mode
            this.repaintInEditMode();
            this._tickStart();
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
        this._requestId = Ticker.requestAnimationFrame(this._bindedTick);

        var now = Ticker.now();
        if (this._isUpdating || this._stepOnce) {
            // play mode

            //if (sceneLoadingQueue) {
            //    return;
            //}
            Time._update(now, false, this._stepOnce ? 1 / 60 : 0);
            this._stepOnce = false;

            //if (this._scene) {
                this.tick(Time.deltaTime, true);
            //}
        }
        else if (FIRE_EDITOR) {
            // edit mode
            Time._update(now, false, this.maxDeltaTimeInEM);
            if (this._shouldRepaintInEM || this.animatingInEditMode) {
                this.tickInEditMode(Time.deltaTime, this.animatingInEditMode);
                this._shouldRepaintInEM = false;
            }
        }
    },

    _tickStart: function () {
        if (this._requestId === -1) {
            this._tick();
        }
    },

    _tickStop: function () {
        if (this._requestId !== -1) {
            Ticker.cancelAnimationFrame(this._requestId);
            this._requestId = -1;
        }
    }
});

/**
 * @event node-attach-to-scene
 * @param {CustomEvent} event
 * @param {RuntimeNode} event.runtimeTarget
 * @private
 */

/**
 * @event node-detach-from-scene
 * @param {CustomEvent} event
 * @param {RuntimeNode} event.runtimeTarget
 * @private
 */

/**
 * @event post-update
 * @param {CustomEvent} event
 * @private
 */

module.exports = EngineWrapper;
