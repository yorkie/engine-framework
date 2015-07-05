var requiringFrames = [];  // the requiring frame infos

Fire._RFpush = function (module, uuid, script) {
    if (arguments.length === 2) {
        script = uuid;
        uuid = '';
    }
    requiringFrames.push({
        uuid: uuid,
        script: script,
        module: module,
        exports: module.exports,    // original exports
        //comp: null
    });
};

Fire._RFpop = function () {
    var frameInfo = requiringFrames.pop();
    // check exports
    var module = frameInfo.module;
    //var exports = frameInfo.exports;
    //if (exports === module.exports) {
    //    for (var anyKey in exports) {
    //        // exported
    //        return;
    //    }
    //    // auto export component
    //    module.exports = frameInfo.comp;
    //}
    var exports = module.exports;
    if (Fire._isFireClass(exports)) {
        if (frameInfo.script) {
            if (! Fire.JS.getClassName(exports)) {
                Fire.JS.setClassName(frameInfo.script, exports);
            }
            else {
                Fire.warn('Sorry, specifying class name for exported FireClass is not allowed.');
            }
        }
        if (frameInfo.uuid) {
            Fire.JS._setClassId(frameInfo.uuid, exports);
        }
    }
};

Fire._RFpeek = function () {
    return requiringFrames[requiringFrames.length - 1];
};
