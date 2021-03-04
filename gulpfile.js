/* global require */

( function gulp() {
  "use strict";

  const babel = require( "gulp-babel" ),
    concat = require( "gulp-concat" ),
    del = require( "del" ),
    gulp = require( "gulp" ),
    factory = require( "widget-tester" ).gulpTaskFactory,
    rename = require( "gulp-rename" ),
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
      "src/rise-licensing.js",
      "src/rise-logger.js",
      "src/rise-local-storage.js",
      "src/rise-watch.js",
      "src/rise-preview.js",
      "src/rise-viewer.js",
      "src/rise-attribute-data.js",
      "src/rise-attribute-data-watch.js",
      "src/rise-display-data.js",
      "src/rise-branding.js",
      "src/rise-content-uptime.js",
      "src/rise-play-until-done.js",
      "src/rise-purge-cached-files.js"
    ],
    testFiles = [
      "test/test_env.js",
      "node_modules/es7-object-polyfill/build/es7-object-polyfill.browser.js",
      "node_modules/promise-polyfill/dist/polyfill.min.js",
      "node_modules/whatwg-fetch/dist/fetch.umd.js",
      "node_modules/dom4/build/dom4.js",
      "src/config/config-test.js"
    ].concat(templateScripts)
    .concat([
      "test/unit/*test.js",
      "test/unit/rise-logger/*test.js"
    ]);

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

  gulp.task( "build", gulp.series( "clean", gulp.parallel( "configScripts", "templateScripts" )));

  gulp.task( "test-unit", factory.testUnitAngular(
    { 
      coverageFiles: "src/**/*.js",
      basePath: '../..',
      testFiles: testFiles
    }
  ));

  gulp.task( "coveralls", factory.coveralls());

  gulp.task( "test", gulp.series( "build", "test-unit" ));

  gulp.task("watch", function () {
    return gulp.watch(["src/*.js", "src/config/config-test.js", "test/unit/**/*.test.js"], gulp.series("test"));
  });

})( console );
