var gulp = require('gulp');
var qunit = require('gulp-qunit');
var fb = require('gulp-fb');

gulp.task('unit-runner', function() {
    var js = paths.test.src;
    var dest = paths.test.src.split('*')[0];
    return gulp.src(js, { read: false, base: './' })
        .pipe(fb.toFileList())
        .pipe(fb.generateRunner(paths.test.runner,
            dest,
            'Engine Framework Test Suite',
            paths.test.lib_min,
            paths.test.lib_dev,
            paths.src))
        .pipe(gulp.dest(dest))
        ;
});

gulp.task('test', ['build', 'unit-runner'], function() {
    console.log('(You need to run "npm install gulp-qunit" before using "gulp test".)');
    var timeOutInSeconds = 5;
    return gulp.src('test/unit/runner.html', { read: false })
        //.pipe(fb.callback(function () {
        //    // launch server
        //    require('./test/server.js');
        //}))
        .pipe(qunit({ timeout: timeOutInSeconds }))
        //.on('error', function(err) {
        //    // Make sure failed tests cause gulp to exit non-zero
        //    throw err;
        //})
        ;
});
