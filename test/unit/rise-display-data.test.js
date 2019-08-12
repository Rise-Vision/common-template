"use strict";

describe( "DisplayData", function() {

  beforeEach( function() {
    sinon.stub( RisePlayerConfiguration, "getDisplayId", function() {
      return "displayId"
    });
  });

  afterEach( function() {
    RisePlayerConfiguration.getDisplayId.restore();
  });

  describe( "rise-local-messaging-connection:", function() {
    beforeEach( function() {
      sinon.spy( RisePlayerConfiguration.Watch, "watchDataFile" );
    });

    afterEach( function() {
      RisePlayerConfiguration.Watch.watchDataFile.restore();
    });

    it( "should not request data when player messaging is not available", function() {
      expect( RisePlayerConfiguration.Watch.watchDataFile.called ).to.be.false;

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: false } });

      expect( RisePlayerConfiguration.Watch.watchDataFile.called ).to.be.false;

    });

    it( "should request data when player messaging is available", function() {
      expect( RisePlayerConfiguration.Watch.watchDataFile.called ).to.be.false;

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      expect( RisePlayerConfiguration.Watch.watchDataFile.called ).to.be.true;
      expect( RisePlayerConfiguration.Watch.watchDataFile ).to.be.calledWith( "risevision-display-notifications/displayId/display.json", sinon.match.func );

    });

    it( "should remove handler and only request data once", function() {
      expect( RisePlayerConfiguration.Watch.watchDataFile.called ).to.be.false;

      window.addEventListener( "rise-local-messaging-connection", RisePlayerConfiguration.DisplayData.connectionHandler );

      window.dispatchEvent( new CustomEvent( "rise-local-messaging-connection", { detail: { isConnected: true } }));

      expect( RisePlayerConfiguration.Watch.watchDataFile.called ).to.be.true;

      window.dispatchEvent( new CustomEvent( "rise-local-messaging-connection", { detail: { isConnected: true } }));

      expect( RisePlayerConfiguration.Watch.watchDataFile.calledOnce ).to.be.true;

    });

  });

  describe( "onDisplayData:", function() {
    var watchHandler;

    beforeEach( function() {
      sinon.stub( RisePlayerConfiguration.Watch, "watchDataFile", function( url, handler ) {
        watchHandler = handler;

        handler( "displayData" );
      });
    });

    afterEach( function() {
      RisePlayerConfiguration.Watch.watchDataFile.restore();
    });

    it( "should ensure displayData is reset for these tests", function() {
      var result = null;

      RisePlayerConfiguration.DisplayData.onDisplayData( function( displayData ) {
        result = displayData;
      });

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });
      watchHandler( null );

      expect( result ).to.be.null;
    });

    it( "should wait for display data to be available", function() {
      var result = null;

      RisePlayerConfiguration.DisplayData.onDisplayData( function( displayData ) {
        result = displayData;
      });

      expect( result ).to.be.null;

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      expect( result ).to.equal( "displayData" );

    });

    it( "should return display data right away if already available", function() {
      var result = null;

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      RisePlayerConfiguration.DisplayData.onDisplayData( function( displayData ) {
        result = displayData;
      });

      expect( result ).to.equal( "displayData" );

    });

    it( "should return display data to multiple handlers", function() {
      var result1,
        result2;

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      RisePlayerConfiguration.DisplayData.onDisplayData( function( displayData ) {
        result1 = displayData;
      });
      RisePlayerConfiguration.DisplayData.onDisplayData( function( displayData ) {
        result2 = displayData;
      });

      expect( result1 ).to.equal( "displayData" );
      expect( result2 ).to.equal( "displayData" );

    });

    it( "should handle display data updates", function() {
      var result;

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });

      RisePlayerConfiguration.DisplayData.onDisplayData( function( displayData ) {
        result = displayData;
      });

      expect( result ).to.equal( "displayData" );

      watchHandler( "displayDataUpdated" );

      expect( result ).to.equal( "displayDataUpdated" );

    });

  });

  describe( "onDisplayAddress:", function() {
    beforeEach( function() {
      sinon.stub( RisePlayerConfiguration.Watch, "watchDataFile", function( url, handler ) {
        handler({ displayAddress: "displayAddress" });
      });

      RisePlayerConfiguration.DisplayData.connectionHandler({ detail: { isConnected: true } });
    });

    afterEach( function() {
      RisePlayerConfiguration.Watch.watchDataFile.restore();
    });

    it( "should return display address", function( done ) {
      RisePlayerConfiguration.DisplayData.onDisplayAddress( function( displayAddress ) {
        expect( displayAddress ).to.equal( "displayAddress" );

        done();
      });
    });

  });

});
