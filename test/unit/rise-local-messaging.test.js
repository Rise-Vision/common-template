/* global describe, it, expect, afterEach, beforeEach, sinon */

"use strict";

describe( "configure()", function() {

  it( "should not attempt to configure if player type is unsupported", function() {
    RisePlayerConfiguration.LocalMessaging.configure({ player: "test" });

    expect( RisePlayerConfiguration.LocalMessaging.getConnectionType()).to.be.undefined;
  });

  it( "should not attempt to configure if no connection type provided", function() {
    RisePlayerConfiguration.LocalMessaging.configure({ player: "electron" });

    expect( RisePlayerConfiguration.LocalMessaging.getConnectionType()).to.be.undefined;
  });

  it( "should not attempt to configure if connection type not supported", function() {
    RisePlayerConfiguration.LocalMessaging.configure({ player: "electron", connectionType: "test" });

    expect( RisePlayerConfiguration.LocalMessaging.getConnectionType()).to.be.undefined;
  });

  it( "should attempt to configure if connection type is 'websocket'", function() {
    RisePlayerConfiguration.LocalMessaging.configure({ player: "electron", connectionType: "websocket" });

    expect( RisePlayerConfiguration.LocalMessaging.getConnectionType()).to.equal( "websocket" );
  });

  it( "should attempt to configure if connection type is 'window'", function() {
    RisePlayerConfiguration.LocalMessaging.configure({ player: "chromeos", connectionType: "window" });

    expect( RisePlayerConfiguration.LocalMessaging.getConnectionType()).to.equal( "window" );
  });

});

describe( "window connection", function() {

  afterEach( function() {
    delete top.postToPlayer;
    delete top.receiveFromPlayer;
  });

  it( "should not be connected if window to player messaging not available", function( done ) {
    var connectionHandler = function( evt ) {
      expect( RisePlayerConfiguration.LocalMessaging.isConnected()).to.be.false;
      expect( evt.detail ).to.deep.equal({ isConnected: false });

      window.removeEventListener( "rise-local-messaging-connection", connectionHandler );

      done();
    };

    window.addEventListener( "rise-local-messaging-connection", connectionHandler );

    RisePlayerConfiguration.LocalMessaging.configure({ player: "chromeos", connectionType: "window" });

  });

  it( "should be connected if window to player messaging available", function( done ) {
    var connectionHandler = function( evt ) {
      expect( RisePlayerConfiguration.LocalMessaging.isConnected()).to.be.true;
      expect( evt.detail ).to.deep.equal({ isConnected: true });

      window.removeEventListener( "rise-local-messaging-connection", connectionHandler );

      done();
    };

    top.postToPlayer = function() {};
    top.receiveFromPlayer = function() {};

    window.addEventListener( "rise-local-messaging-connection", connectionHandler );

    RisePlayerConfiguration.LocalMessaging.configure({ player: "chromeos", connectionType: "window" });
  });

  describe( "receiveMessages", function() {

    beforeEach( function() {
      top.postToPlayer = function() {};
      top.receiveFromPlayer = function( name, handler ) {
        // force test a message
        handler({ topic: "TEST" });
      };
      RisePlayerConfiguration.LocalMessaging.configure({ player: "chromeos", connectionType: "window" });
    });

    afterEach( function() {
      delete top.postToPlayer;
      delete top.receiveFromPlayer;
    });

    it( "should execute handler when message is received", function() {
      var spy = sinon.spy();

      RisePlayerConfiguration.LocalMessaging.receiveMessages( spy );

      expect( spy ).to.have.been.calledWith({ topic: "TEST" });
    });
  });

  describe( "broadcastMessage", function() {

    beforeEach( function() {
      top.postToPlayer = sinon.spy();
      top.receiveFromPlayer = function() {};
    });

    afterEach( function() {
      delete top.postToPlayer;
      delete top.receiveFromPlayer;
    });

    it( "should not attempt to post to player if no message provided", function() {
      RisePlayerConfiguration.LocalMessaging.configure({ player: "chromeos", connectionType: "window" });
      RisePlayerConfiguration.LocalMessaging.broadcastMessage();

      expect( top.postToPlayer ).to.not.have.been.called;
    });

    it( "should not attempt to broadcast if no connection available", function() {
      delete top.receiveFromPlayer;

      RisePlayerConfiguration.LocalMessaging.configure({ player: "chromeos", connectionType: "window" });
      RisePlayerConfiguration.LocalMessaging.broadcastMessage({ topic: "TEST" });

      expect( top.postToPlayer ).to.not.have.been.called;
    });

    it( "should broadcast message to player with default client name", function() {
      RisePlayerConfiguration.LocalMessaging.configure({ player: "chromeos", connectionType: "window" });
      RisePlayerConfiguration.LocalMessaging.broadcastMessage({ topic: "TEST" });

      expect( top.postToPlayer ).to.have.been.calledWith({ topic: "TEST", from: "ws-client" });
    });

    it( "should broadcast message to player with configured client name", function() {
      RisePlayerConfiguration.LocalMessaging.configure({ player: "chromeos", connectionType: "window", detail: { clientName: "test-client" } });
      RisePlayerConfiguration.LocalMessaging.broadcastMessage({ topic: "TEST" });

      expect( top.postToPlayer ).to.have.been.calledWith({ topic: "TEST", from: "test-client" });
    });

    it( "should be able to handle a String for message param", function() {
      RisePlayerConfiguration.LocalMessaging.configure({ player: "chromeos", connectionType: "window" });
      RisePlayerConfiguration.LocalMessaging.broadcastMessage( "TEST" );

      expect( top.postToPlayer ).to.have.been.calledWith({ msg: "TEST", from: "ws-client" });
    });
  });

});
