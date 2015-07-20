var JS = Fire.JS;

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
        var parent = this.runtimeParent;
        return parent && Fire.node(parent);
    },
    function (value) {
        if (FIRE_EDITOR && value && !value.constructor.canHaveChildrenInEditor) {
            Fire.warn('Can not add "%s" to "%s" which type is "%s".', this.name, value.name, JS.getClassName(value));
            if (!this.runtimeParent) {
                this.runtimeParent = Fire.engine.getCurrentRuntimeScene();
            }
        }
        else {
            this.runtimeParent = value && value.runtimeTarget;
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
            return this.runtimeChildren.map(Fire.node);
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
    }
});
