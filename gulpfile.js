/* global require */

( function gulp() {
  "use strict";

  const babel = require( "gulp-babel" ),
    gulp = require( "gulp" ),
    factory = require( "widget-tester" ).gulpTaskFactory,
    rename = require( "gulp-rename" ),
    runSequence = require( "run-sequence" ),
    sourcemaps = require( "gulp-sourcemaps" ),
    uglify = require( "gulp-uglify" )

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
    runSequence( "scripts", cb );
  });

  gulp.task( "test-unit", factory.testUnitAngular(
    { testFiles: [
      "dist/rise-player-configuration.js",
      "dist/rise-local-messaging.js",
      "test/unit/*test.js" ] }
  ));

  gulp.task( "test", [ "build" ], ( cb ) => {
    runSequence( "test-unit", cb );
  });

})( console );
