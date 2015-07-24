﻿// jshint ignore: start

test('deserialize missing script', function() {

    var MissingScript = Fire.extend('MissingScript').prop('_$erialized', null);
    MissingScript.safeFindClass = function (id) {
        return Fire.JS._getClassById(id) || MissingScript;
    };

    var ToMiss = Fire.extend('ToMiss').prop('ref', null);

    var obj = new ToMiss();
    obj.ref = new Fire.FObject();

    var lastData = Editor.serialize(obj);
    delete obj.__id__;
    delete obj.ref.__id__;
    Fire.JS.unregisterClass(ToMiss);

    // deserialize

    var missed = Fire.deserialize(lastData, null, {classFinder: MissingScript.safeFindClass});

    var expectBackup = {
        "__type__": "ToMiss",
        "ref": obj.ref,
    };
    deepEqual(missed._$erialized, expectBackup, 'can deserialize missing script');

    // serialize

    reSerialized = Editor.serialize(missed, {stringify: false});
    delete obj.ref.__id__;
    deepEqual(reSerialized, JSON.parse(lastData), 'can serialize missing script as its original data');

    //// re deserialize after fixed, no need to test ;)
    //Fire.setClassName('ToMiss', ToMiss);
    //var recovered = Fire.deserialize(reSerialized);
    //deepEqual(recovered, obj, 'can deserialize correctly after script fixed');
    //Fire.unregisterClass(ToMiss);
});

// jshint ignore: end
