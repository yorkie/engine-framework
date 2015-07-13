var JS = Fire.JS;
var SceneWrapper = require('../wrappers/scene');

/**
 * @module Fire.Runtime
 */

/**
 * @class EngineWrapper
 */

var EngineWrapper = require('../wrappers/engine');
var engineProto = EngineWrapper.prototype;

JS.mixin(engineProto, {

    /**
     * Get the wrapper of current running scene.
     * @method getCurrentScene
     * @return {SceneWrapper}
     */
    getCurrentScene: function () {
        return Fire.node(this.getCurrentRuntimeScene());
    },

    /**
     * Returns the wrapper of the node which id is id.
     * @method getRuntimeInstanceById
     * @param {String} id
     * @return {Object}
     */
    getInstanceById: function (id) {
        return Fire.node(this.getRuntimeInstanceById(id));
    },

    _initScene: function (sceneWrapper, callback) {
        if (sceneWrapper._needCreate) {
            sceneWrapper.create(callback);
        }
        else {
            callback();
        }
    },

    /**
     * Launch loaded scene.
     * @method _launchScene
     * @param {SceneWrapper} scene
     * @param {function} [onBeforeLoadScene]
     * @private
     */
    _launchScene: function (scene, onBeforeLoadScene) {
        var self = this;

        if (!scene) {
            Fire.error('Argument must be non-nil');
            return;
        }

        if (FIRE_EDITOR && scene._needCreate) {
            Fire.error('The scene wrapper %s is not yet fully created', scene.name);
            return;
        }

        //Engine._dontDestroyEntities.length = 0;

        //// unload scene
        //var oldScene = Engine._scene;
        //
        ////editorCallback.onStartUnloadScene(oldScene);
        //
        //if (Fire.isValid(oldScene)) {
        //    // destroyed and unload
        //    AssetLibrary.unloadAsset(oldScene, true);
        //}
        //
        //// purge destroyed entities belongs to old scene
        //FObject._deferredDestroy();
        //
        //Engine._scene = null;

        if (onBeforeLoadScene) {
            onBeforeLoadScene();
        }

        //// init scene
        //Engine._renderContext.onSceneLoaded(scene);

        ////if (editorCallback.onSceneLoaded) {
        ////    editorCallback.onSceneLoaded(scene);
        ////}

        //// launch scene
        //scene.entities = scene.entities.concat(Engine._dontDestroyEntities);
        //Engine._dontDestroyEntities.length = 0;
        self._setCurrentRuntimeScene(scene.runtimeTarget);
        //Engine._renderContext.onSceneLaunched(scene);

        //editorCallback.onBeforeActivateScene(scene);

        //scene.activate();

        //editorCallback.onSceneLaunched(scene);
    },

    /**
     * Loads the scene by its name.
     * @method loadScene
     * @param {string} sceneName - the name of the scene to load
     * @param {function} [onLaunched] - callback, will be called after scene launched
     * @param {function} [onUnloaded] - callback, will be called when the previous scene was unloaded
     * @return {boolean} if error, return false
     */
    loadScene: function (sceneName, onLaunched, onUnloaded) {
        if (this._loadingScene) {
            Fire.error('[Engine.loadScene] Failed to load scene "%s" because "%s" is already loading', sceneName, this._loadingScene);
            return false;
        }
        var uuid = this._sceneInfos[sceneName];
        if (uuid) {
            this._loadingScene = sceneName;
            this._loadSceneByUuid(uuid, onLaunched, onUnloaded);
            return true;
        }
        else {
            Fire.error('[Engine.loadScene] Can not load the scene "%s" because it has not been added to the build settings.', sceneName);
            return false;
        }
    },

    /**
     * Loads the scene by its uuid.
     * @method _loadSceneByUuid
     * @param {string} uuid - the uuid of the scene asset to load
     * @param {function} [onLaunched]
     * @param {function} [onUnloaded]
     * @private
     */
    _loadSceneByUuid: function (uuid, onLaunched, onUnloaded) {
        var self = this;
        //Fire.AssetLibrary.unloadAsset(uuid);     // force reload
        Fire.AssetLibrary.loadAsset(uuid, function (error, scene) {
            if (error) {
                error = 'Failed to load scene: ' + error;
                if (FIRE_EDITOR) {
                    console.assert(false, error);
                }
            }
            else if (!(scene instanceof SceneWrapper)) {
                error = 'The asset ' + uuid + ' is not a scene';
                scene = null;
            }
            if (scene) {
                self._initScene(scene, function () {
                    self._launchScene(scene, onUnloaded);
                    self._loadingScene = '';
                    if (onLaunched) {
                        onLaunched(scene, error);
                    }
                });
            }
            else {
                Fire.error(error);
                self._loadingScene = '';
                if (onLaunched) {
                    onLaunched(scene, error);
                }
            }
        });
    }
});
