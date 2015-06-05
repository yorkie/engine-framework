
var Runtime = {};

Fire.JS.mixin(Runtime, {
    NodeWrapper: require('./wrappers/node')
});

require('./register');

module.exports = Runtime;
