var gulp = require('gulp');
var requireDir = require('require-dir');

// specify game project paths for tasks.
global.paths = {
    src: './src',
    out: './bin',
    outBasename: 'engine-framework.js',

    test: {
        src: 'test/unit/**/*.js',
        runner: 'test/lib/runner.html',
        lib_dev: [
            'bin/engine-framework.js',
        ],
        lib_min: [
            'bin/engine-framework.min.js',
        ]
    },

    get scripts() { return this.src + '/**/*.js'; },
    get jsEntry() { return this.src + '/index'; }
};

// require all tasks in gulp/tasks, including sub-folders
requireDir('./gulp/tasks', { recurse: true });

// default task
gulp.task('default', ['jshint', 'build']);
