// The default mixin solution
var JS = Fire.JS;

//var tmpArray = [];

var mixin = {
    mixin: function (node, cls) {
        if (FIRE_EDITOR && !Fire._isFireClass(cls)) {
            Fire.error('The class to mixin must be FireClass.');
            return;
        }
        var newMixinClassId = JS._getClassId(cls);
        if (FIRE_EDITOR && !newMixinClassId) {
            Fire.error("The class to mixin must have class name or script's uuid.");
            return;
        }

        // call constructor on node
        cls.call(node);

        var nodeClass = node.constructor;

        // mixin prototype
        var nodeProto = nodeClass.prototype;
        var clsProto = cls.prototype;
        JS.mixin(nodeProto, clsProto);  // 这里也会 mixin cls 的父类
        nodeProto.constructor = nodeClass;  // restore overrided constructor
            //if (cls.$super === Fire.FObject) {
            //}
            //else {
            //    tmpArray.length = 0;
            //    var arrayOfBaseClass = tmpArray;
            //    // 从基类开始，把 prototype 一级一级 mixin 下来
            //    for (; cls && cls.$super; cls = cls.$super) {
            //        arrayOfBaseClass.push(cls);
            //    }
            //    for (var i = arrayOfBaseClass.length - 1; i >= 0; i--) {
            //        var baseClass = arrayOfBaseClass[i];
            //        JS.mixin(nodeProto, baseClass.prototype);
            //    }
            //}

        var props = cls.__props__;

            //// mixin properties (getset 类型的 properties 并不是 enumerable 的，所以没办法用 JS.mixin 直接 mixin 进来)
            //for (var j = 0, len = props.length; j < len; j++) {
            //    var propName = props[j];
            //    // getter or setter
            //    var pd = JS.getPropertyDescriptor(clsProto, propName);
            //    if (pd && !pd.enumerable) {
            //        Object.defineProperty(nodeProto, propName, pd);
            //    }
            //}

        // TODO - behaviours

        // assign __props__ array
        if (props) {
            var existsProps = nodeClass.__props__;
            if (existsProps) {
                nodeClass.__props__ = existsProps.concat(props);
            }
            else {
                nodeClass.__props__ = props;
            }
        }

        // save class id to wrapper
        var wrapper = Fire.node(node);
        var mixinId = wrapper.mixinId;
        if (mixinId) {
            if (Array.isArray(mixinId)) {
                mixinId.push(newMixinClassId);
            }
            else {
                mixinId = [mixinId, newMixinClassId];
            }
        }
        else {
            wrapper.mixinId = newMixinClassId;
        }
    }
};

module.exports = mixin;
