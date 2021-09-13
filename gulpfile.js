const gulp = require('gulp');
const {watch} = require('gulp');
const terser = require('terser');
const gulpTerser = require('gulp-terser');

function es(){
  return gulp.src('./src/**/*.js')
    .pipe(gulpTerser({}, terser.minify))
    .pipe(gulp.dest('./dist'));
}

function esWatch() {
    watch('./src/**/*.js', es);
}

exports.default = esWatch;