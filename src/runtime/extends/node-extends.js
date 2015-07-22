var JS = Fire.JS;
var Behavior = Fire.Behavior;

/**
 * @module Fire.Runtime
 */

/**
 * @class NodeWrapper
 */
var NodeWrapper = require('../wrappers/node');

var nodeProto = NodeWrapper.prototype;

/**
 * The parent of the wrapper.
 * If this is the top most node in hierarchy, its parent must be type SceneWrapper.
 * Changing the parent will keep the transform's local space position, rotation and scale the same but modify
 * the world space position, scale and rotation.
 * @property parent
 * @type {NodeWrapper}
 */
JS.getset(nodeProto, 'parent',
    function () {
        var parent = this.parentN;
        return parent && Fire(parent);
    },
    function (value) {
        if (FIRE_EDITOR && value && !value.constructor.canHaveChildrenInEditor) {
            Fire.warn('Can not add "%s" to "%s" which type is "%s".', this.name, value.name, JS.getClassName(value));
            if (!this.parentN) {
                this.parentN = Fire.engine.getCurrentSceneN();
            }
        }
        else {
            this.parentN = value && value.targetN;
        }
    }
);

/**
 * Returns a new array which contains wrappers of child nodes.
 * @property children
 * @type {NodeWrapper[]}
 */
JS.get(nodeProto, 'children',
    function () {
        if (!FIRE_EDITOR || this.constructor.canHaveChildrenInEditor) {
            return this.childrenN.map(Fire);
        }
        else {
            return [];
        }
    }
);

/**
 * The position relative to the scene.
 * @property scenePosition
 * @type {Fire.Vec2}
 * @private
 */
JS.getset(nodeProto, 'scenePosition',
    function () {
        var scene = Fire.engine && Fire.engine.getCurrentScene();
        if (!scene) {
            Fire.error('Can not access scenePosition if no running scene');
            return Fire.Vec2.zero;
        }

        return scene.transformPointToLocal( this.worldPosition );
    },
    function (value) {
        var scene = Fire.engine && Fire.engine.getCurrentScene();
        if (!scene) {
            Fire.error('Can not access scenePosition if no running scene');
            return;
        }

        this.worldPosition = scene.transformPointToWorld(value);
    }
);

/**
 * The rotation relative to the scene.
 * @property sceneRotation
 * @type {Number}
 * @private
 */
JS.getset(nodeProto, 'sceneRotation',
    function () {
        var scene = Fire.engine && Fire.engine.getCurrentScene();
        if (!scene) {
            Fire.error('Can not access sceneRotation if no running scene');
            return 0;
        }

        return this.worldRotation - scene.rotation;
    },
    function (value) {
        var scene = Fire.engine && Fire.engine.getCurrentScene();
        if (!scene) {
            Fire.error('Can not access sceneRotation if no running scene');
            return;
        }

        this.worldRotation = scene.rotation + value;
    }
);

/**
 * The lossy scale relative to the scene. (Read Only)
 * @property sceneScale
 * @type {Fire.Vec2}
 * @readOnly
 * @private
 */
JS.getset(nodeProto, 'sceneScale',
    function () {
        var scene = Fire.engine && Fire.engine.getCurrentScene();
        if (!scene) {
            Fire.error('Can not access sceneScale if no running scene');
            return Fire.Vec2.one;
        }

        return this.worldScale.div(scene.scale);
    }
);

JS.obsolete(nodeProto, 'NodeWrapper.id', 'uuid', false);

JS.mixin(nodeProto, {
    /**
     * Is this node an instance of Scene?
     *
     * @property isScene
     */
    isScene: false,

    /**
     * Is this wrapper a child of the parentWrapper?
     *
     * @method isChildOf
     * @param {NodeWrapper} parentWrapper
     * @return {boolean} - Returns true if this wrapper is a child, deep child or identical to the given wrapper.
     */
    isChildOf: function (parentWrapper) {
        var child = this;
        do {
            if (child === parentWrapper) {
                return true;
            }
            child = child.parent;
        }
        while (child);
        return false;
    },

    /**
     * Move the node to the top.
     *
     * @method setAsFirstSibling
     */
    setAsFirstSibling: function () {
        this.setSiblingIndex(0);
    },

    /**
     * Move the node to the bottom.
     *
     * @method setAsLastSibling
     */
    setAsLastSibling: function () {
        this.setSiblingIndex(-1);
    },

    _onActivated: function () {
        // invoke mixin scripts
        if (!FIRE_EDITOR || Fire.engine._isPlaying) {
            Behavior.onActivated(this.targetN);
        }
        //
        if (FIRE_EDITOR) {
            if (!Fire.engine._isPlaying) {
                var focused = Editor.Selection.curActivate('node') === this.uuid;
                if (focused && this.onFocusInEditor) {
                    this.onFocusInEditor();
                }
                else if (this.onLostFocusInEditor) {
                    this.onLostFocusInEditor();
                }
            }
        }
        // activate children recursively
        var children = this.childrenN;
        for (var i = 0, len = children.length; i < len; ++i) {
            var node = children[i];
            Fire(node)._onActivated();
        }
    },
});
