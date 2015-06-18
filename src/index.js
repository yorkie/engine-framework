require('./polyfill');

var Fire = require('./core');

if (FIRE_EDITOR) {
    // TODO - exclude editor in browserify (https://github.com/substack/node-browserify#bexcludefile)
    var Editor = require('./editor');

    if (Editor.isCoreLevel) {
        Editor.versions['engine-framework'] = require('../package.json').version;
    }
}

if (Fire.isWeb) {
    // PAGE LEVEL
    Fire.Runtime = require('./runtime');
}

module.exports = Fire;
