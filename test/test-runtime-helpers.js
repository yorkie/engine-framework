require('../src');
require('./lib/init');

//// make runtime available in core-level
//Fire.Runtime = require('../src/runtime');

var PageLevel = true;
var CoreLevel = false;


describe('Runtime helpers', function () {
    if (PageLevel && Fire.isCoreLevel) {
        var spawnRunner = require('./lib/spawn-runner');
        spawnRunner(this.title, __filename);
        if (!CoreLevel) {
            // only test in page-level
            return;
        }
    }

    var Helpers = Fire.Runtime.Helpers;

    before(function () {
        Helpers.init();
    });

    after(function () {
        Fire.engine.off('post-update', Helpers._debounceNodeEvent);
    });

    var MyNode = Fire.Class({});
    var MyNodeWrapper = Fire.Class({
        extends: Fire.Runtime.NodeWrapper,
        properties: {
            uuid: {
                get: function () {
                    return this.targetN.uuid;
                }
            }
        }
    });
    Fire.Runtime.registerNodeType(MyNode, MyNodeWrapper);

    it('should emit "node-attach-to-scene"', function () {
        var c1 = new MyNode();
        c1.uuid = 1;

        var target;
        Fire.engine.once("node-attach-to-scene", function (event) {
            target = event.detail.targetN;
        });
        Helpers.onNodeAttachedToParent(c1);

        expect(target).to.be.equals(c1);
    });

    it('should emit "node-detach-from-scene" in next frame', function () {
        var c1 = new MyNode();
        c1.uuid = 1;

        var target;
        Fire.engine.once("node-detach-from-scene", function (event) {
            target = event.detail.targetN;
        });
        Helpers.onNodeDetachedFromParent(c1);

        Fire.engine.emit("post-update");

        expect(target).to.be.equals(c1);
    });

    it('should maintains attached node', function () {
        var c1 = new MyNode();
        c1.uuid = 1;

        Helpers.onNodeAttachedToParent(c1);
        expect(Fire.engine.attachedWrappers[c1.uuid]).to.be.equals(Fire(c1));

        Helpers.onNodeDetachedFromParent(c1);
        Fire.engine.emit("post-update");
        expect(Fire.engine.attachedWrappers[c1.uuid]).to.be.undefined;
    });

    it('should debounce event in one frame', function () {
        var c1 = new MyNode();
        c1.uuid = 1;
        var c2 = new MyNode();
        c2.uuid = 2;

        var target = [];
        Fire.engine.once("node-detach-from-scene", function (event) {
            target.push(event.detail.targetN);
        });

        Fire.engine.attachedWrappers[c1.uuid] = 'unchanged';

        Helpers.onNodeDetachedFromParent(c1);
        Helpers.onNodeDetachedFromParent(c2);
        Helpers.onNodeAttachedToParent(c1);

        Fire.engine.emit("post-update");

        expect(target).to.be.deep.equals([c2]);
        expect(Fire.engine.attachedWrappers[c1.uuid]).to.be.equals('unchanged');
        expect(Fire.engine.attachedWrappers[c2.uuid]).to.be.undefined;
    });
});
