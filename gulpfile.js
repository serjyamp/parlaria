'use strict';

var gulp = require('gulp'),
    connect = require('gulp-connect'),
    opn = require('opn'),
    scss = require('gulp-sass'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    uglify = require('gulp-uglify'),
    prettify = require('gulp-jsbeautifier'),
    csso = require('gulp-csso'),
    autoprefixer = require('gulp-autoprefixer'),
    pug = require('gulp-pug');

var bc = './bower_components/';
var nm = './node_modules/';

gulp.task('js', function() {
    gulp.src('builds/src/app/**/*.js')
        .pipe(concat('app.js'))
        .pipe(ngAnnotate())
        // .pipe(uglify())
        .pipe(gulp.dest('builds/dest/app/'))
        .pipe(connect.reload());
});

gulp.task('fonts', function() {
    gulp.src('builds/src/fonts/**/*.*')
        .pipe(gulp.dest('builds/dest/fonts/'))
        .pipe(connect.reload());
});

gulp.task('pug', function() {
    gulp.src('builds/src/**/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(prettify({
            html: {
                unformatted: [],
                indent_char: '\t',
                indent_size: 1
            }
        }))
        .pipe(gulp.dest('builds/dest/'))
        .pipe(connect.reload());
});

gulp.task('scss', function() {
    gulp.src('builds/src/scss/all.scss')
        .pipe(scss())
        .pipe(autoprefixer('> 0%'))
        .pipe(csso())
        .pipe(concat('styles.min.css'))
        .pipe(gulp.dest('builds/dest/css/'))
        .pipe(connect.reload());
});

gulp.task('img', function() {
    gulp.src('builds/src/img/**/*')
        .pipe(gulp.dest('builds/dest/img/'))
        .pipe(connect.reload());
});

gulp.task('watch', function() {
    gulp.watch('builds/src/app/**/*.js', ['js']);
    gulp.watch('builds/src/scss/**/*', ['scss']);
    gulp.watch('builds/src/**/*.pug', ['pug']);
    gulp.watch('builds/src/img/**/*', ['img']);
});

gulp.task('vendor', function() {
    gulp.src(bc + 'components-font-awesome/css/font-awesome.min.css')
        .pipe(gulp.dest('./builds/dest/vendor/fa/css'));
    gulp.src(bc + 'components-font-awesome/fonts/*')
        .pipe(gulp.dest('./builds/dest/vendor/fa/fonts'));

    gulp.src(bc + 'jquery/dist/jquery.min.js')
        .pipe(gulp.dest('./builds/dest/vendor/jquery/'));

    gulp.src(bc + 'bootstrap/dist/**/*.*')
        .pipe(gulp.dest('./builds/dest/vendor/bootstrap/'));

    gulp.src(bc + 'bootstrap-material-design/dist/css/bootstrap-material-design.min.css')
        .pipe(gulp.dest('./builds/dest/vendor/bootstrap-material-design/'));
    gulp.src(bc + 'bootstrap-material-design/dist/js/material.min.js')
        .pipe(gulp.dest('./builds/dest/vendor/bootstrap-material-design/'));

    gulp.src([
            bc + 'angular/angular.js',
            bc + 'angular-ui-router/release/angular-ui-router.js',
            bc + 'firebase/firebase.js',
            bc + 'angularfire/dist/angularfire.min.js'
        ])
        .pipe(concat('angular.concat.js'))
        .pipe(gulp.dest('./builds/dest/vendor/angular/'));

    gulp.src(bc + 'angular-bootstrap-colorpicker/css/colorpicker.min.css')
        .pipe(gulp.dest('./builds/dest/vendor/angular-bootstrap-colorpicker/css'));
    gulp.src(bc + 'angular-bootstrap-colorpicker/img/*.*')
        .pipe(gulp.dest('./builds/dest/vendor/angular-bootstrap-colorpicker/img'));
    gulp.src(bc + 'angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js')
        .pipe(gulp.dest('./builds/dest/vendor/angular-bootstrap-colorpicker/js'));

    gulp.src(bc + 'angular-wysiwyg/dist/angular-wysiwyg.min.js')
        .pipe(gulp.dest('./builds/dest/vendor/angular-wysiwyg'));

    gulp.src(bc + 'chart.js/dist/Chart.min.js')
        .pipe(gulp.dest('./builds/dest/vendor'));
    gulp.src(nm + 'angular-chart.js/dist/angular-chart.min.js')
        .pipe(gulp.dest('./builds/dest/vendor'));
});

gulp.task('connect', function() {
    connect.server({
        root: 'builds/dest/',
        livereload: true
    });
    opn('http://localhost:8080');
});

gulp.task('default', [
    'vendor',
    'fonts',
    'pug',
    'img',
    'js',
    'scss',
    'connect',
    'watch'
]);
