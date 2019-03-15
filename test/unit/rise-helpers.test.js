
/* global describe, document, it, expect, afterEach, beforeEach, sinon */

"use strict";

describe( "Helpers", function() {

  afterEach( function() {
    RisePlayerConfiguration.Helpers.reset();

    document.getElementsByTagName.restore();
  });

  describe( "getRiseElements", function() {

    beforeEach( function() {
      sinon.stub( document, "getElementsByTagName", function() {
        return [
          { tagName: "HTML" },
          { tagName: "HEAD" },
          { tagName: "BODY" },
          {
            tagName: "RISE-DATA-IMAGE"
          },
          {
            tagName: "RISE-DATA-FINANCIAL"
          },
          {
            tagName: "RISE-IMAGE"
          },
          { tagName: "P" }
        ];
      });
    });

    it( "should get list of rise elements", function() {
      var elements = RisePlayerConfiguration.Helpers.getRiseElements();

      expect( elements ).to.be.ok;
      expect( elements.length ).to.equal( 3 );
      expect( elements[ 0 ].tagName ).to.equal( "RISE-DATA-IMAGE" );
      expect( elements[ 1 ].tagName ).to.equal( "RISE-DATA-FINANCIAL" );
      expect( elements[ 2 ].tagName ).to.equal( "RISE-IMAGE" );
    });
  });

});

describe( "Helpers / window connection", function() {

  afterEach( function() {
    delete top.postToPlayer;
    delete top.receiveFromPlayer;

    RisePlayerConfiguration.Helpers.reset();
  });

  describe( "onceClientsAreAvailable", function() {
    it( "should always invoke the action in ChromeOS player", function() {
      var spy = sinon.spy();

      RisePlayerConfiguration.LocalMessaging.configure({
        player: "chromeos", connectionType: "window"
      });

      RisePlayerConfiguration.Helpers.onceClientsAreAvailable( "local-storage", spy );

      expect( spy ).to.have.been.called;
    });
  });

});

describe( "Helpers / websocket connection", function() {

  var socketInstance,
    clock;

  function createSocketInstance() {
    return {
      end: sinon.spy(),
      on: sinon.spy(),
      write: sinon.spy(),
      open: sinon.spy()
    };
  }

  beforeEach( function() {
    socketInstance = createSocketInstance();
    top.PrimusLMS = { connect: function() {} };
    clock = sinon.useFakeTimers();
    sinon.stub( top.PrimusLMS, "connect", function( url ) {
      socketInstance.url = url;
      return socketInstance;
    });
  });

  afterEach( function() {
    top.PrimusLMS.connect.restore();
    delete top.PrimusLMS;
    clock.restore();
  });

  describe( "onceClientsAreAvailable", function() {
    var messagingInternalDataHandler;

    beforeEach( function() {
      var dataHandlerRegistration;

      RisePlayerConfiguration.LocalMessaging.configure({
        player: "electron",
        connectionType: "websocket",
        detail: { serverUrl: "http://localhost:8080" }
      });

      dataHandlerRegistration = socketInstance.on.args.filter( function( call ) {
        return call[ 0 ] === "data";
      })[ 0 ];
      messagingInternalDataHandler = dataHandlerRegistration[ 1 ];
    });

    it( "should request the client list if the requested module is not present in player electron", function() {
      var call = socketInstance.on.args.filter( function( call ) {
          return call[ 0 ] === "open";
        })[ 0 ],
        handler = call[ 1 ];

      handler();

      RisePlayerConfiguration.Helpers.onceClientsAreAvailable( "local-storage", function() {
      });

      expect( socketInstance.write ).to.have.been.calledWith({
        topic: "client-list-request", from: "ws-client"
      });
    });

    it( "should invoke the action when local storage module is present", function( done ) {
      RisePlayerConfiguration.Helpers.onceClientsAreAvailable( "local-storage", done );

      messagingInternalDataHandler({
        topic: "client-list",
        clients: [
          "local-storage", "logging", "watchdog", "licensing", "installer"
        ]
      });
    });

    it( "should invoke the action when local storage and licensing modules are present", function( done ) {
      RisePlayerConfiguration.Helpers.onceClientsAreAvailable([
        "local-storage", "licensing"
      ], done );

      messagingInternalDataHandler({
        topic: "client-list",
        clients: [
          "local-storage", "logging", "watchdog", "installer"
        ]
      });

      messagingInternalDataHandler({
        topic: "client-list",
        clients: [
          "local-storage", "logging", "watchdog", "licensing", "installer"
        ]
      });
    });

  });

});
