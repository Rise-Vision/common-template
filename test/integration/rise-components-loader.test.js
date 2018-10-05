/* global describe, it, expect, afterEach */

"use strict";

describe( "ComponentLoader", function() {

  afterEach( function() {
    RisePlayerConfiguration.ComponentLoader.clear();
  });

  describe( "fetchAndLoadComponents", function() {

    it( "should perform the remote code fetch and notify when it has loaded", function( done ) {
      function componentsLoadedHandler( event ) {
        window.removeEventListener( "rise-components-loaded", componentsLoadedHandler );

        expect( event.detail.isLoaded ).to.be.true;
        done();
      }

      window.addEventListener( "rise-components-loaded", componentsLoadedHandler );

      RisePlayerConfiguration.configure({ playerType: "beta" }, {});

      RisePlayerConfiguration.ComponentLoader.load();

      RisePlayerConfiguration.ComponentLoader.fetchAndLoadComponents([
        {
          name: "rise-integration-test",
          url: "http://storage.googleapis.com/widgets.risevision.com/test/integration_test_01.js"
        }
      ]);
    });

  });

});
