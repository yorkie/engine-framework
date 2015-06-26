function NYI () {
    if (FIRE_EDITOR) {
        Fire.error('Not yet implemented');
    }
}

function NYI_Accessor (defVal, attrs, noSetter) {
    var prop = {
        get: function () {
            NYI();
            return defVal;
        }
    };
    if (!noSetter) {
        prop.set = NYI;
    }
    if (attrs) {
        return JS.mixin(prop, attrs);
    }
    else {
        return prop;
    }
}

module.exports = {
    NYI: NYI,
    NYI_Accessor: NYI_Accessor
};
