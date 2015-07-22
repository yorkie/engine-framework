
var detachingNodes = [];
var debouncedCount = 0;

module.exports = {
    init: function () {
        if (FIRE_EDITOR) {
            Fire.engine.on('post-update', this._debounceNodeEvent);
        }
    },

    // assert(node)
    onNodeAttachedToParent: function (node) {
        if (FIRE_EDITOR) {
            var uuid = Fire(node).uuid;
            if (!uuid) {
                return;
            }
            var index = detachingNodes.lastIndexOf(uuid);
            if (index !== -1) {
                // debounce
                if (index === detachingNodes.length - 1) {
                    --detachingNodes.length;
                }
                else {
                    detachingNodes[index] = null;
                    ++debouncedCount;
                }
            }
            else {
                // new node
                Fire.engine.emit('node-attach-to-scene', {
                    targetN: node
                });
            }
        }
    },

    // assert(node)
    onNodeDetachedFromParent: function (node) {
        if (FIRE_EDITOR) {
            var uuid = Fire(node).uuid;
            if (!uuid) {
                return;
            }
            detachingNodes.push(uuid);
        }
    },

    _debounceNodeEvent: function () {
        if (FIRE_EDITOR) {
            if (detachingNodes.length > debouncedCount) {
                for (var i = 0, len = detachingNodes.length; i < len; ++i) {
                    var id = detachingNodes[i];
                    if (id) {
                        var wrapper = Fire.engine.attachedWrappers[id];
                        if (wrapper && wrapper.targetN) {
                            Fire.engine.emit('node-detach-from-scene', {
                                targetN: wrapper.targetN
                            });
                        }
                        else {
                            Editor.error("Failed to get last frame's node to detach, " +
                                         wrapper ? "target node not exists." : "wrapper not attached.");
                        }
                    }
                }
            }
            detachingNodes.length = 0;
            debouncedCount = 0;
        }
    }
};
