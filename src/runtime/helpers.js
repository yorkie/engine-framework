
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
            var index = detachingNodes.lastIndexOf(node);
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
            detachingNodes.push(node);
        }
    },

    _debounceNodeEvent: function () {
        if (FIRE_EDITOR) {
            if (detachingNodes.length > debouncedCount) {
                for (var i = 0, len = detachingNodes.length; i < len; ++i) {
                    var node = detachingNodes[i];
                    if (node) {
                        Fire.engine.emit('node-detach-from-scene', {
                            targetN: node
                        });
                    }
                }
            }
            detachingNodes.length = 0;
            debouncedCount = 0;
        }
    }
};
