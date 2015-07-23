require('../src');
require('./lib/init');
var BehTester = require('./lib/behavior-callback-tester');

var DebugPage = 0;
var PageLevel = true;
var CoreLevel = false;

describe('Behavior', function () {
    if (PageLevel && Fire.isCoreLevel) {
        var spawnRunner = require('./lib/spawn-runner');
        spawnRunner(this.title, __filename, DebugPage);
        if (!CoreLevel) {
            // only test in page-level
            return;
        }
    }

    var MyNode = Fire.Class({
        constructor: function () {
            this.children = [];
        }
    });
    var MyNodeWrapper = Fire.Class({
        extends: Fire.Runtime.NodeWrapper,
        properties: {
            childrenN: {
                get: function () {
                    return this.targetN.children;
                }
            }
        }
    });
    Fire.Runtime.registerNodeType(MyNode, MyNodeWrapper);

    describe('onLoad', function () {

        describe('in edit mode', function () {
            before(function () {
                Fire.engine._reset();
            });
            it('should not be called in edit mode', function () {
                var node = new MyNode();
                var called = false;
                Fire.mixin(node, Fire.Class({
                    extends: Fire.Behavior,
                    onLoad: function () {
                        called = true;
                    }
                }));
                expect(called).to.be.false;
            });
        });

        describe('in play mode', function () {
            var Script = Fire.Class({
                extends: Fire.Behavior,
                onLoad: function () {
                    this.onLoadCalled = true;
                }
            });
            var Script2 = Fire.Class({
                extends: Fire.Behavior,
                onLoad: function () {
                    this.onLoadCalledBy2 = true;
                }
            });

            var node1 = new MyNode();
            Fire.mixin(node1, Script);
            var node2 = new MyNode();
            Fire.mixin(node2, Script);

            var bigNode = new MyNode();
            Fire.mixin(bigNode, Script, Script2);

            node1.children = [node2, bigNode];

            before(function () {
                Fire.engine._reset();
                Fire.engine.play();
            });

            it('should be called when play', function () {
                Fire(node1)._onActivated();

                expect(node1.onLoadCalled).to.be.true;
                expect(node2.onLoadCalled).to.be.true;
                expect(bigNode.onLoadCalled).to.be.true;
                expect(bigNode.onLoadCalledBy2).to.be.true;
            });

            it('could be called only once', function () {
                node1.onLoadCalled = false;
                Fire(node1)._onActivated();

                expect(node1.onLoadCalled).to.be.false;
            });

            it('should be called if script attached dynamically', function () {
                var node = new MyNode();
                Fire.mixin(node, Script);

                expect(node.onLoadCalled).to.be.true;

                node.onLoadCalled = false;

                Fire.mixin(node, Script2);

                expect(node.onLoadCalled).to.be.false;   // only called once
                expect(node.onLoadCalledBy2).to.be.true;
            });
        });
    });

    describe('update', function () {
        before(function () {
            Fire.engine._reset();
        });
        it('should be forbidden in edit mode', function () {
            var node = new MyNode();
            var called = false;
            Fire.mixin(node, Fire.Class({
                extends: Fire.Behavior,
                update: function () {
                    called = true;
                }
            }));
            node.update();
            expect(called).to.be.false;
        });
    });
});