module('mixin');

test('basic', function() {
    var mixinOpt = Fire.getMixinOptions();

    function Node () {}
    Node.prototype.getAge = function () {};
    var NodeWrapper = Fire.Class({
        extends: Fire.Runtime.NodeWrapper
    });
    Fire.Runtime.registerNodeType(Node, NodeWrapper);

    var originGetAge = Node.prototype.getAge;
    var node = new Node();

    var Script = Fire.Class({
        name: '2154648724566',
        extends: Fire.Class({
            constructor: function () {
                this.realAge = 30;
            },
            properties: {
                age: {
                    default: 40,
                    tooltip: 'Age'
                }
            },
            getAge: function () {
                return this.age;
            }
        }),
        constructor: function () {
            this._name = 'ha';
        },
        properties: {
            name: {
                get: function () {
                    return this._name;
                },
                displayName: 'Name'
            }
        },
        getName: function () {
            return this.name;
        }
    });

    mixinOpt.mixin(node, Script);

    strictEqual(node.constructor, Node, 'constructor should not changed');

    strictEqual(node._name, 'ha', 'should execute constructor');
    strictEqual(node.name, 'ha', 'should mixin properties');
    strictEqual(Fire.attr(node, 'name').displayName, 'Name', 'should mixin attributes');
    strictEqual(node.getName(), 'ha', 'should mixin methods');

    strictEqual(node.realAge, 30, 'should mixin base constructor');
    strictEqual(node.age, 40, 'should mixin base properties');
    strictEqual(Fire.attr(node, 'age').tooltip, 'Age', 'should mixin base attributes');
    notStrictEqual(node.getAge, originGetAge, 'should override origin methods');
    strictEqual(node.getAge(), 40, 'should mixin base methods');

    Fire.JS.unregisterClass(Script);
});

//test('inherited', function() {
//    var mixinOpt = Fire.getMixinOptions();
//
//    function Node () {}
//    var node = new Node();
//
//    var Script = Fire.Class({
//        constructor: function () {
//            this._name = 'ha';
//        },
//        properties: {
//            name: {
//                get: function () {
//                    return this._name;
//                },
//                displayName: 'Name'
//            }
//        },
//        getName: function () {
//            return this.name;
//        }
//    });
//
//    mixinOpt.mixin(node, Script);
//
//    strictEqual(node._name, 'ha', 'should mixin constructor');
//    strictEqual(node.name, 'ha', 'should mixin properties');
//    strictEqual(Fire.attr(node, 'name').displayName, 'Name', 'should mixin attributes');
//    strictEqual(node.getName(), 'ha', 'should mixin methods');
//});
