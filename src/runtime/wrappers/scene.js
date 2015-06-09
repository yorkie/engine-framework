/**
 * @module Fire.Runtime
 */

var NodeWrapper = require('./node');

/**
 * You should override:
 * - childNodes
 * - getCurrentSceneNode (static)
 * - createEmpty (static)
 *
 * @class SceneWrapper
 * @extends NodeWrapper
 * @constructor
 * @param {RuntimeNode} node - The root node of current stage.
 */
var SceneWrapper = Fire.Class({
    name: 'Fire.Runtime.SceneWrapper',
    extends: NodeWrapper,

    properties: {
        parentNode: {
            get: function () {
                return null;
            },
            set: function () {
                if (FIRE_DEV) {
                    Fire.error("Disallow to set scene's parent.");
                }
            }
        }
    },

    statics: {
        /**
         * Get the current running scene.
         * @method getCurrentSceneNode
         * @return {RuntimeNode}
         * @static
         */
        getCurrentSceneNode: function () {
            if (FIRE_EDITOR) {
                Fire.error('Not yet implemented');
            }
            return null;
        }
    },

    getSiblingIndex: function () {
        return 0;
    },

    setSiblingIndex: function (index) {
        if (FIRE_DEV) {
            if (index !== 0) {
                Fire.error("Disallow to change scene's sibling index.");
            }
        }
    }
});

module.exports = SceneWrapper;
