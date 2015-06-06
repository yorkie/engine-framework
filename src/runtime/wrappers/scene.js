/**
 * @module Fire.Runtime
 */

var NodeWrapper = require('./node');

/**
 * You should override:
 * - children
 * - getCurrentScene (static)
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
        parent: {
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
         * @method getCurrentScene
         * @return {RuntimeNode}
         * @static
         */
        getCurrentScene: function () {
            if (FIRE_EDITOR) {
                Fire.error('Not yet implemented');
            }
        }
    },

    /**
     * Set the sibling index of this node.
     *
     * @method setSiblingIndex
     * @param {number} index
     */
    setSiblingIndex: function (index) {
        if (FIRE_DEV) {
            if (index !== 0) {
                Fire.error("Disallow to change scene's sibling index.");
            }
        }
    }
});

module.exports = SceneWrapper;
