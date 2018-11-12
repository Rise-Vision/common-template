/* global require */

( function gulp() {
  "use strict";

  const babel = require( "gulp-babel" ),
    concat = require( "gulp-concat" ),
    del = require( "del" ),
    gulp = require( "gulp" ),
    factory = require( "widget-tester" ).gulpTaskFactory,
    rename = require( "gulp-rename" ),
    runSequence = require( "run-sequence" ),
    sourcemaps = require( "gulp-sourcemaps" ),
    uglify = require( "gulp-uglify" ),
    configScripts = [
      "src/config/config-*.js"
    ],
    templateScripts = [
      "src/rise-player-configuration.js",
      "src/rise-local-messaging.js",
      "src/rise-helpers.js",
      "src/rise-heartbeat.js",
      "src/rise-logger.js",
      "src/rise-local-storage.js"
    ];

  gulp.task( "clean", function( cb ) {
    return del([ "./dist/**" ], cb );
  });

  gulp.task( "configScripts", () => {
    return gulp.src( configScripts )
      .pipe( babel({
        presets: [ "env" ],
        plugins: [ "transform-object-assign" ]
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

  gulp.task( "templateScripts", () => {
    return gulp.src( templateScripts )
      .pipe( concat( "common-template.js" ))
      .pipe( babel({
        presets: [ "env" ],
        plugins: [ "transform-object-assign" ]
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
    runSequence([ "clean" ], [ "configScripts", "templateScripts" ], cb );
  });

  gulp.task( "test-unit", factory.testUnitAngular(
    { testFiles: [
      "test/test_env.js",
      "node_modules/promise-polyfill/dist/polyfill.min.js",
      "node_modules/whatwg-fetch/dist/fetch.umd.js",
      "node_modules/dom4/build/dom4.js",
      "dist/config-test.js",
      "dist/common-template.js",
      "test/unit/*test.js",
      "test/unit/rise-logger/*test.js" ] }
  ));

  gulp.task( "test", ( cb ) => {
    runSequence([ "build" ], [ "test-unit" ], cb );
  });

})( console );
