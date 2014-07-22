'use strict';
var gulp = require('gulp');
var jshint = require('gulp-jshint');
gulp.task('js:lint', function() {
  return gulp.src(['./angular-navigation-service.js', './gulpfile.js', './spec/services.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
gulp.task('js:test', function() {
  var mochaPhantom = require('gulp-mocha-phantomjs');
  return gulp.src('./test.html')
    .pipe(mochaPhantom());
});
gulp.task('default', ['js:lint', 'js:test']);