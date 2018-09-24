/* global require */

( function gulp( console ) {
  "use strict";

  const babel = require("gulp-babel"),
    gulp = require( "gulp" ),
    runSequence = require( "run-sequence" );

  gulp.task( "scripts", () => {
    return gulp.src([
      "src/rise-local-messaging.js",
      "src/rise-player-configuration.js"
    ])
      .pipe( babel( {
        presets: [ "env" ],

      } ) )
      .pipe(gulp.dest("dist"));
  } );

  gulp.task( "build", ( cb ) => {
    runSequence( "scripts", cb );
  } );

} )( console );
