if (FIRE_EDITOR) {
    function call_FUNC_InTryCatch (c) {
        try {
            c._FUNC_();
        }
        catch (e) {
            Fire._throw(e);
        }
    }
    var execInTryCatchTmpl = '(' + call_FUNC_InTryCatch + ')';
    // jshint evil: true
    //var callOnEnableInTryCatch = eval(execInTryCatchTmpl.replace(/_FUNC_/g, 'onEnable'));
    //var callOnDisableInTryCatch = eval(execInTryCatchTmpl.replace(/_FUNC_/g, 'onDisable'));
    var callOnLoadInTryCatch = eval(execInTryCatchTmpl.replace(/_FUNC_/g, 'onLoad'));
    //var callOnStartInTryCatch = eval(execInTryCatchTmpl.replace(/_FUNC_/g, 'start'));
    //var callOnDestroyInTryCatch = eval(execInTryCatchTmpl.replace(/_FUNC_/g, 'onDestroy'));
    //var callOnFocusInTryCatch = eval(execInTryCatchTmpl.replace(/_FUNC_/g, 'onFocusInEditMode'));
    //var callOnLostFocusInTryCatch = eval(execInTryCatchTmpl.replace(/_FUNC_/g, 'onLostFocusInEditMode'));
    // jshint evil: false
}

var Behavior = Fire.Class({
    name: 'Fire.Behavior',

    /**
     * When attaching to an active node or its node first activated
     * @method onLoad
     */
    onLoad: null,
});

Behavior.onActivated = function (target) {
    if (FIRE_EDITOR) {
        if (target.onLoad) {
            callOnLoadInTryCatch(target);
        }
    }
    else {
        if (target.onLoad) {
            target.onLoad();
        }
    }
    //if (target._enabled) {
    //    _callOnEnable(target, active);
    //}
};

Fire.Behavior = Behavior;

module.exports = Behavior;
