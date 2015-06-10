var Fire = require('./core');

Fire.Runtime = require('./runtime');

if (FIRE_EDITOR || FIRE_TEST) {
    // TODO - exclude editor in browserify (https://github.com/substack/node-browserify#bexcludefile)
    require('./editor');
}

module.exports = Fire;
