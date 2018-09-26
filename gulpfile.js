/* global require */

( function gulp() {
  "use strict";

  const babel = require( "gulp-babel" ),
    del = require( "del" ),
    gulp = require( "gulp" ),
    factory = require( "widget-tester" ).gulpTaskFactory,
    rename = require( "gulp-rename" ),
    runSequence = require( "run-sequence" ),
    sourcemaps = require( "gulp-sourcemaps" ),
    uglify = require( "gulp-uglify" );

  gulp.task( "clean", function( cb ) {
    return del([ "./dist/**" ], cb );
  });

  gulp.task( "scripts", () => {
    return gulp.src([
      "src/rise-local-messaging.js",
      "src/rise-player-configuration.js"
    ])
      .pipe( babel({
        presets: [ "env" ],
      }))
      .pipe( gulp.dest( "dist" ))
      .pipe( sourcemaps.init())
      .pipe( rename(( path ) => {
        path.basename += ".min";
      }))
      .pipe( uglify())
      .pipe( sourcemaps.write())
      .pipe( gulp.dest( "dist" ));
  });

  gulp.task( "build", ( cb ) => {
    runSequence([ "clean" ], [ "scripts" ], cb );
  });

  gulp.task( "test-unit", factory.testUnitAngular(
    { testFiles: [
      "dist/rise-player-configuration.js",
      "dist/rise-local-messaging.js",
      "test/unit/*test.js" ] }
  ));

  gulp.task( "test", ( cb ) => {
    runSequence([ "build" ], [ "test-unit" ], cb );
  });

})( console );
