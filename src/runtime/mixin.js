// The default mixin solution

var tmpArray = [];

var mixin = {
    mixin: function (node, cls) {
        // call constructor on node
        cls.call(node);

        // mixin prototype
        // TODO - check attributes also applied
        var nodeProto = node.constructor.prototype;
        if (cls.$super === Fire.FObject) {
            Fire.JS.mixin(nodeProto, Fire.FObject.prototype, cls.prototype);
        }
        else {
            tmpArray.length = 0;
            var arrayOfBaseClass = tmpArray;
            // 从基类开始，把 prototype 一级一级 mixin 下来
            for (; cls && cls.$super; cls = cls.$super) {
                arrayOfBaseClass.push(cls);
            }
            for (var i = arrayOfBaseClass.length - 1; i >= 0; i--) {
                var baseClass = arrayOfBaseClass[i];
                Fire.JS.mixin(nodeProto, baseClass.prototype);
            }
        }

        // TODO - behaviours

        // apply properties
        var props = cls.__props__;
        if (props) {
            var existsProps = node.__props__;
            if (existsProps) {
                node.__props__ = existsProps.concat(props);
            }
        }
    }
};

module.exports = mixin;
