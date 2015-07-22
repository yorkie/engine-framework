if (FIRE_TEST) {
    module.exports = function () {
        return '' + ((new Date()).getTime() + Math.random());
    };
}
else if (FIRE_EDITOR) {
    var Uuid = require('node-uuid');
    module.exports = function () {
        var uuid = Uuid.v4();
        return Editor.compressUuid(uuid);
    };
}
else {
    module.exports = function () {
        Fire.error('Can only use uuid inside editor.');
        return '';
    };
}
