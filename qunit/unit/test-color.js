module('color');

test('basic test', function() {
    var testColor = new Fire.Color( 1.0, 1.0, 0.0, 0.5 );
    equal ( testColor.toHEX('#rrggbb'), "ffff00", "The value must be ffff00" );
    equal ( testColor.toHEX('#rgb'), "ff0", "The value must be ff0" );
    equal ( testColor.toCSS('#rrggbb'), "#ffff00", "The value must be #ffff00" );
    equal ( testColor.toCSS('#rgb'), "#ff0", "The value must be #ff0" );

    testColor = new Fire.Color( 0.3, 1.0, 0.0, 0.5 );
    equal ( testColor.toHEX('#rrggbb'), "4cff00", "The value must be ffff00" );
    equal ( testColor.toHEX('#rgb'), "4f0", "The value must be ff0" );
    equal ( testColor.toCSS('#rrggbb'), "#4cff00", "The value must be #ffff00" );
    equal ( testColor.toCSS('#rgb'), "#4f0", "The value must be #ff0" );

    testColor = new Fire.Color( 1.0, 0.0, 0.0, 1.0 );
    deepEqual ( testColor.toHSV(), { h: 0, s: 1, v: 1 }, "The value must be { h:0, s:1, v:1 }" );
    deepEqual ( testColor.fromHSV(0,1,1).toCSS('#rrggbb'), '#ff0000', "The value must be #ff0000" );
    deepEqual ( testColor.fromHSV(1,1,1).toCSS('#rrggbb'), '#ff0000', "The value must be #ff0000" );
});
