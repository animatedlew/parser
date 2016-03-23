'use strict';
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const shell = require('gulp-shell');

gulp.task('test', ['build'], () => gulp.src('test/**/*.js', { read: false }).pipe(mocha({ reporter: 'spec' })));
gulp.task('build', () => gulp.src('./parser.ts').pipe(shell(['tsc -p .'])));
gulp.task('run', ['build'], () => gulp.src('./parser.js').pipe(shell(['node <%= file.path %>'])));
gulp.task('default', ['run', 'test'], () => {});

