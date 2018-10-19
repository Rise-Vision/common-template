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
      "src/config/config-prod.js",
      "src/config/config-test.js",
      "src/rise-component-loader.js",
      "src/rise-helpers.js",
      "src/rise-local-messaging.js",
      "src/rise-local-storage.js",
      "src/rise-logger.js",
      "src/rise-player-configuration.js"
    ])
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
    runSequence([ "clean" ], [ "scripts" ], cb );
  });

  gulp.task( "test-unit", factory.testUnitAngular(
    { testFiles: [
      "test/test_env.js",
      "node_modules/promise-polyfill/dist/polyfill.min.js",
      "node_modules/whatwg-fetch/dist/fetch.umd.js",
      "node_modules/dom4/build/dom4.js",
      "dist/config-test.js",
      "dist/rise-player-configuration.js",
      "dist/rise-local-messaging.js",
      "dist/rise-helpers.js",
      "dist/rise-logger.js",
      "dist/rise-local-storage.js",
      "dist/rise-component-loader.js",
      "test/unit/*test.js",
      "test/unit/rise-logger/*test.js" ] }
  ));

  gulp.task( "test-integration", factory.testUnitAngular(
    { testFiles: [
      "test/test_env.js",
      "node_modules/promise-polyfill/dist/polyfill.min.js",
      "node_modules/whatwg-fetch/dist/fetch.umd.js",
      "node_modules/dom4/build/dom4.js",
      "dist/config-test.js",
      "dist/rise-player-configuration.js",
      "dist/rise-local-messaging.js",
      "dist/rise-helpers.js",
      "dist/rise-logger.js",
      "dist/rise-local-storage.js",
      "dist/rise-component-loader.js",
      "test/integration/*test.js" ] }
  ));

  gulp.task( "test", ( cb ) => {
    runSequence([ "build" ], [ "test-unit" ], [ "test-integration" ], cb );
  });

})( console );
