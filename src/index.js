require('./polyfill');

var Fire = require('./core');

if (FIRE_EDITOR) {
    // TODO - exclude editor in browserify (https://github.com/substack/node-browserify#bexcludefile)
    require('./editor');
}

if (Fire.isWeb) {
    // PAGE LEVEL
    Fire.Runtime = require('./runtime');
}

module.exports = Fire;
