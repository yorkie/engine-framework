var Fire = require('./core');

Fire.Runtime = require('./runtime');

if (Fire.isEditor) {
    // TODO - exclude editor in browserify (https://github.com/substack/node-browserify#bexcludefile)
    require('./editor');
}

module.exports = Fire;
