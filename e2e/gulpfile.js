const gulp = require( "gulp" ),
  sass = require( "gulp-sass" ),
  plumber = require( "gulp-plumber" ),
  autoprefixer = require( "gulp-autoprefixer" );

const browserSync = require("browser-sync");
const reload = browserSync.reload;

gulp.task( "styles", () => {
  gulp.src( "scss/main.scss" )
    .pipe( plumber())
    .pipe( sass().on( "error", sass.logError ))
    .pipe( autoprefixer())
    .pipe( gulp.dest( "src/css" ))
    .pipe(reload({stream:true}))
});

gulp.task("watch", () => {
  gulp.watch("scss/**/*.scss", ["styles"]);
});

gulp.task("browser-sync", () => {
  browserSync({
    port: 8000,
    server: {
      baseDir:"."
    }
  });
});

gulp.task("browser-sync-test", () => {
  browserSync({
    port: 8000,
    server: {
      baseDir:"."
    }
  });
});

gulp.task("default", ["styles", "watch", "browser-sync"]);
gulp.task("test", ["styles", "watch", "browser-sync-test"])
