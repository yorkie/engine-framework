require('../src');

//describe('Editor.setPropertyByPath', function() {
//    it("should set property if path not contains '.'", function() {
//        var target = {
//            height: 1,
//            position: Fire.v2(123, 456),
//            foo: {
//                bar: Fire.color(0.5, 0.5, 0.5, 0.5),
//            }
//        };
//        Editor.setPropertyByPath(target, 'height', 10);
//        expect(target.height).to.be.equal(10);
//    });
//
//    describe("If path contains one '.'", function () {
//        var target = {
//            height: 1,
//            position: Fire.v2(123, 456),
//            foo: {
//                bar: Fire.color(0.5, 0.5, 0.5, 0.5),
//            }
//        };
//        var originPos = target.position;
//        Editor.setPropertyByPath(target, 'position.x', 10);
//
//        it("should set sub property", function() {
//            expect(target.position.x).to.be.equal(10);
//        });
//        it("should not change other property", function() {
//            expect(target.position.y).to.be.equal(456);
//        });
//        it("should not change the reference of main property", function() {
//            expect(target.position).to.be.equal(originPos);
//        });
//    });
//
//    describe("If path contains more '.'", function () {
//        var target = {
//            height: 1,
//            position: Fire.v2(123, 456),
//            foo: {
//                bar: Fire.color(0.5, 0.5, 0.5, 0.5),
//            }
//        };
//        var originFoo = target.foo;
//        Editor.setPropertyByPath(target, 'foo.bar.r', 1);
//
//        it("should set sub property", function() {
//            expect(target.foo.bar.r).to.be.equal(1);
//        });
//        it("should not change other property", function() {
//            expect(target.foo.bar).to.be.deep.equal(Fire.color(1, 0.5, 0.5, 0.5));
//        });
//        it("should not change the reference of main property", function() {
//            expect(target.foo).to.be.equal(originFoo);
//        });
//    });
//});

describe('Editor.setDeepPropertyByPath', function() {
    it("should set property if path not contains '.'", function() {
        var target = {
            height: 1,
            position: Fire.v2(123, 456),
            foo: {
                bar: Fire.color(0.5, 0.5, 0.5, 0.5),
            }
        };
        Editor.setDeepPropertyByPath(target, 'height', 10);
        expect(target.height).to.be.equal(10);
    });

    describe("Testing if path contains one '.'", function () {
        var target = {
            height: 1,
            position: Fire.v2(123, 456),
            foo: {
                bar: Fire.color(0.5, 0.5, 0.5, 0.5),
            }
        };
        var originPos = target.position;
        Editor.setDeepPropertyByPath(target, 'position.x', 10);

        it("should set sub property", function() {
            expect(target.position.x).to.be.equal(10);
        });
        it("should not change other property", function() {
            expect(target.position.y).to.be.equal(456);
        });
        it("should not change the reference of main property", function() {
            expect(target.position).to.be.equal(originPos);
        });
    });

    describe("Testing if path contains more '.'", function () {
        var target = {
            height: 1,
            position: Fire.v2(123, 456),
            foo: {
                bar: Fire.color(0.5, 0.5, 0.5, 0.5),
            }
        };
        var originFoo = target.foo;
        Editor.setDeepPropertyByPath(target, 'foo.bar.r', 1);

        it("should set sub property", function() {
            expect(target.foo.bar.r).to.be.equal(1);
        });
        it("should not change other property", function() {
            expect(target.foo.bar).to.be.deep.equal(Fire.color(1, 0.5, 0.5, 0.5));
        });
        it("should not change the reference of main property", function() {
            expect(target.foo).to.be.equal(originFoo);
        });
    });

    describe('Testing if property is primitive object with multi-key', function () {
        it("should set property deeply if path not contains '.'", function() {
            var target = {
                height: 1,
                position: Fire.v2(123, 456),
                foo: {
                    bar: Fire.color(0.5, 0.5, 0.5, 0.5),
                }
            };
            Editor.setDeepPropertyByPath(target, 'position', {x: 10, y: 20});
            expect(target.position).to.be.an.instanceof(Fire.Vec2);
            expect(target.position.x).to.be.equal(10);
            expect(target.position.y).to.be.equal(20);
        });

        describe("Testing if path contains one '.'", function () {
            var target = {
                height: 1,
                position: Fire.v2(123, 456),
                foo: {
                    bar: Fire.color(0.5, 0.5, 0.5, 0.5),
                }
            };
            var originColor = target.foo.bar;

            Editor.setDeepPropertyByPath(target, 'foo.bar', {r: 0, g:0, b:0, a:1});

            it("should set sub property deeply", function() {
                expect(target.foo.bar).to.be.deep.equal(Fire.color(0, 0, 0, 1));
            });
            it("should not change the reference of parent property", function() {
                expect(target.foo.bar).to.be.equal(originColor);
            });
        });

        describe("Testing if path contains more '.'", function () {
            var target = {
                height: 1,
                position: Fire.v2(123, 456),
                foo: {
                    bar: Fire.color(0.5, 0.5, 0.5, 0.5),
                    bar2: {
                        baz: Fire.color(0.1, 0.2, 0.3, 0.4)
                    }
                }
            };
            var originColor = target.foo.bar2.baz;
            Editor.setDeepPropertyByPath(target, 'foo.bar2.baz', {r: 0, g:0, b:0, a:1});

            it("should set sub property", function() {
                expect(target.foo.bar2.baz).to.be.deep.equal(Fire.color(0, 0, 0, 1));
            });
            it("should not change the reference of main property", function() {
                expect(target.foo.bar2.baz).to.be.equal(originColor);
            });
        });
    });

});
