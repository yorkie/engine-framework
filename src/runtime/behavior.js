
/**
 * Base class for every scripts mixin to Nodes.
 * This class will not instantiate actually, it just used to define properties and methods to mixin.
 *
 * NOTE: Should not use constructor, use `onLoad` instead please.
 *
 * @class Behavior
 * @constructor
 */
var Behavior = Fire.Class({
    name: 'Fire.Behavior',

    /**
     * Called when attaching to a node.
     * @method onLoad
     */
    onLoad: null,

    ///**
    // * Called before all scripts' update.
    // * @method start
    // */
    //start: null,

    /**
     * Update is called every frame.
     * @method update
     */
    update: null,
});

Behavior.onActivated = function (target) {
    if (target.onLoad) {
        target.onLoad();
    }
    //if (target._enabled) {
    //    _callOnEnable(target, active);
    //}
};

// life cycle methods

var CallLcmOnceTmpl;
if (FIRE_EDITOR) {
    CallLcmOnceTmpl = function () {
        if (!Fire.engine._isPlaying) {
            return;
        }
        for (var i = 0; i < this._mixinContexts.length; i++) {
            var ctx = this._mixinContexts[i];
            if (!(ctx._objFlags & _FLAG_)) {
                var func = ctx._FUNC_;
                if (func) {
                    try {
                        func.call(this);
                    }
                    catch (e) {
                        Fire._throw(e);
                    }
                }
                ctx._objFlags |= _FLAG_;
            }
        }
        this._FUNC_ = null;
    };
}
else {
    CallLcmOnceTmpl = function () {
        for (var i = 0; i < this._mixinContexts.length; i++) {
            var ctx = this._mixinContexts[i];
            if (!(ctx._objFlags & _FLAG_)) {
                var func = ctx._FUNC_;
                if (func) {
                    func.call(this);
                }
                ctx._objFlags |= _FLAG_;
            }
        }
        this._FUNC_ = null;
    };
}

var CallLcmTmpl;
if (FIRE_EDITOR) {
    CallLcmTmpl = function () {
        if (!Fire.engine._isPlaying) {
            return;
        }
        for (var i = 0; i < this._mixinContexts.length; i++) {
            var ctx = this._mixinContexts[i];
            var func = ctx._FUNC_;
            if (func) {
                try {
                    func.apply(this, arguments);
                }
                catch (e) {
                    Fire._throw(e);
                }
            }
        }
    };
}
else {
    CallLcmTmpl = function () {
        for (var i = 0; i < this._mixinContexts.length; i++) {
            var ctx = this._mixinContexts[i];
            var func = ctx._FUNC_;
            if (func) {
                func.apply(this, arguments);
            }
        }
    };
}

// define LC methods
var LCMethods = {
    onLoad: {
        tmpl: CallLcmOnceTmpl,
        flag: Fire._ObjectFlags.IsOnLoadCalled
    },
    //start: {
    //    tmpl: CallLcmOnceTmpl,
    //    flag: Fire._ObjectFlags.IsOnStartCalled
    //},
    onEnter: {
        tmpl: CallLcmTmpl,
    },
    onExit: {
        tmpl: CallLcmTmpl,
    },
    update: {
        tmpl: CallLcmTmpl,
    }
};
var LCMethodNames = Object.keys(LCMethods);

// generate LC invokers
var LCInvokers = {};
for (var j = 0; j < LCMethodNames.length; j++) {
    var name = LCMethodNames[j];
    var info = LCMethods[name];
    var tmpl = '(' + info.tmpl + ')';
    tmpl = tmpl.replace(/_FUNC_/g, name);
    if (info.flag) {
        tmpl = tmpl.replace(/_FLAG_/g, info.flag);
    }
    LCInvokers[name] = eval(tmpl);
}

// exports
Fire.Behavior = Behavior;
Behavior.LCMethodNames = LCMethodNames;
Behavior.lcmInvokers = LCInvokers;
module.exports = Behavior;
