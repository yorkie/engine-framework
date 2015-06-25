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
        return Fire.node(this.getCurrentSceneNode());
    },

    /**
     * Set the wrapper of current running scene.
     * @method _setCurrentScene
     * @param {SceneWrapper}
     */
    _setCurrentScene: function (sceneWrapper) {
        if (FIRE_EDITOR && sceneWrapper._needCreate) {
            Fire.error('The scene wrapper %s is not yet fully created', sceneWrapper.name);
            return;
        }
        this._setCurrentSceneNode(sceneWrapper.target);
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
                scene.create(function () {
                    //self._launchScene(scene, onUnloaded);
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
