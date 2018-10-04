/* global describe, it, expect, afterEach */

"use strict";

describe( "ComponentLoader", function() {

  afterEach( function() {
    RisePlayerConfiguration.ComponentLoader.clear();
  });

  describe( "load", function() {

    var rolloutEnvironment;

    function createConnectionEvent( isConnected ) {
      return new CustomEvent( "rise-local-messaging-connection", {
        detail: { isConnected: isConnected }
      })
    }

    it( "should recognize the rollout environment as beta", function() {
      RisePlayerConfiguration.configure({ playerType: "beta" }, {});

      RisePlayerConfiguration.ComponentLoader.load();

      rolloutEnvironment = RisePlayerConfiguration.ComponentLoader.getRolloutEnvironment();

      expect( rolloutEnvironment ).to.equal( "beta" );
    });

    it( "should recognize the rollout environment as stable", function() {
      RisePlayerConfiguration.configure({ playerType: "stable" }, {});

      RisePlayerConfiguration.ComponentLoader.load();

      rolloutEnvironment = RisePlayerConfiguration.ComponentLoader.getRolloutEnvironment();

      expect( rolloutEnvironment ).to.equal( "stable" );
    });

    it( "should assume a development rollout environment if developmentManifestUrl is provided", function() {
      RisePlayerConfiguration.configure({
        developmentManifestUrl: "http://localhost:9000/manifest.json"
      }, {});

      RisePlayerConfiguration.ComponentLoader.load();

      rolloutEnvironment = RisePlayerConfiguration.ComponentLoader.getRolloutEnvironment();

      expect( rolloutEnvironment ).to.equal( "development" );
    });

    it( "should not set the rollout environment if an invalid player type is provided", function( done ) {
      function componentsLoadedHandler( event ) {
        window.removeEventListener( "rise-components-loaded", componentsLoadedHandler );

        expect( event.detail.isLoaded ).to.be.false;
        done();
      }

      window.addEventListener( "rise-components-loaded", componentsLoadedHandler );

      RisePlayerConfiguration.configure({ playerType: "other" }, {});

      RisePlayerConfiguration.ComponentLoader.load();

      rolloutEnvironment = RisePlayerConfiguration.ComponentLoader.getRolloutEnvironment();

      expect( rolloutEnvironment ).to.be.null;
    });

    it( "should not set the rollout environment if no player type is provided", function( done ) {
      function componentsLoadedHandler( event ) {
        window.removeEventListener( "rise-components-loaded", componentsLoadedHandler );

        expect( event.detail.isLoaded ).to.be.false;
        done();
      }

      window.addEventListener( "rise-components-loaded", componentsLoadedHandler );

      RisePlayerConfiguration.configure({}, {});

      RisePlayerConfiguration.ComponentLoader.load();

      rolloutEnvironment = RisePlayerConfiguration.ComponentLoader.getRolloutEnvironment();

      expect( rolloutEnvironment ).to.be.null;
    });

    it( "should attempt to load the components only once", function() {
      var connectionEvent = createConnectionEvent( true ),
        disconnectionEvent = createConnectionEvent( false );

      rolloutEnvironment = RisePlayerConfiguration.ComponentLoader.getRolloutEnvironment();
      expect( rolloutEnvironment ).to.be.null;

      // register the listener as runtime would do
      window.addEventListener( "rise-local-messaging-connection", RisePlayerConfiguration.ComponentLoader.connectionHandler );

      RisePlayerConfiguration.configure({ playerType: "beta" }, {});

      // it shouldn't attempt to load if not connected
      window.dispatchEvent( disconnectionEvent );

      rolloutEnvironment = RisePlayerConfiguration.ComponentLoader.getRolloutEnvironment();
      expect( rolloutEnvironment ).to.be.null;

      // simulate connection
      window.dispatchEvent( connectionEvent );

      rolloutEnvironment = RisePlayerConfiguration.ComponentLoader.getRolloutEnvironment();
      expect( rolloutEnvironment ).to.equal( "beta" );

      // clear state, so we can see if it's initialized again later
      RisePlayerConfiguration.ComponentLoader.clear();

      connectionEvent = new CustomEvent( "rise-local-messaging-connection", {
        detail: { isConnected: true }
      });
      window.dispatchEvent( connectionEvent );

      // the component load is not attempted again.
      rolloutEnvironment = RisePlayerConfiguration.ComponentLoader.getRolloutEnvironment();
      expect( rolloutEnvironment ).to.be.null;
    });

  });

  describe( "fetchAndLoadComponents", function() {

    it( "should send the components loaded event with true flag if the component could be fetched and loaded", function( done ) {
      function componentsLoadedHandler( event ) {
        window.removeEventListener( "rise-components-loaded", componentsLoadedHandler );

        expect( event.detail.isLoaded ).to.be.true;
        done();
      }

      window.addEventListener( "rise-components-loaded", componentsLoadedHandler );

      RisePlayerConfiguration.configure({ playerType: "beta" }, {});

      RisePlayerConfiguration.ComponentLoader.load();

      RisePlayerConfiguration.ComponentLoader.fetchAndLoadComponents([]);
    });

  });

});
