var gulp = require('gulp'),  
  pug = require('gulp-pug');
const { watch } = require('gulp');
// run this task by typing in gulp pug in CLI

function compile(){
    return gulp.src('views/*.pug')
      .pipe(pug({
          doctype: 'html',
          pretty: true
        })) // pipe to pug plugin
      .pipe(gulp.dest('tmp')); // tell gulp our output folder
}

gulp.task('watch', function () {
    return watch('views/*.pug', compile)
});
