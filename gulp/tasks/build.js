var Fs = require('fs');
var Path = require('fire-path');

var gulp = require('gulp');
var mirror = require('gulp-mirror');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var handleErrors = require('../util/handleErrors');

function rebundle(bundler) {
    var bundle = bundler.bundle()
        .on('error', handleErrors.handler)
        .pipe(handleErrors())
        .pipe(source(paths.outBasename))
        .pipe(buffer());

    var dev = sourcemaps.init({loadMaps: true});
    dev.pipe(sourcemaps.write('./', {sourceRoot: './'}))
        .pipe(gulp.dest(paths.out));

    var min = rename({ suffix: '.min' })
    min.pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./', {sourceRoot: './', addComment: false}))
        .pipe(gulp.dest(paths.out));

    return bundle.pipe(mirror(dev, min));
}

function createBundler() {
    var options = {
        debug: true,
        standalone: 'engine-framework'
        //basedir: tempScriptDir
    };
    // https://github.com/substack/node-browserify#methods
    var bundler = new browserify(paths.jsEntry, options);
    return bundler;
}

gulp.task('build', ['clean'], function () {
    return rebundle(createBundler());
});
