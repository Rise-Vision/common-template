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

describe( "websocket connection", function() {

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

  it( "should register error handler", function() {
    var call,
      handler;

    sinon.stub( console, "log" );

    RisePlayerConfiguration.LocalMessaging.configure({ player: "electron", connectionType: "websocket", detail: { serverUrl: "http://localhost:8080" } });

    call = socketInstance.on.args.filter( function( call ) {
      return call[ 0 ] === "error";
    })[ 0 ];
    expect( call ).to.be.ok;

    handler = call[ 1 ];
    handler({ message: "test" });
    expect( console.log ).to.have.been.calledWith( "local messaging error" ); // eslint-disable-line no-console

    console.log.restore(); // eslint-disable-line no-console
  });

  it( "should register data handler", function() {
    var call,
      handler;

    RisePlayerConfiguration.LocalMessaging.configure({ player: "electron", connectionType: "websocket", detail: { serverUrl: "http://localhost:8080" } });

    call = socketInstance.on.args.filter( function( call ) {
      return call[ 0 ] === "data";
    })[ 0 ];
    expect( call ).to.be.ok;

    handler = call[ 1 ];
    expect( handler ).to.be.ok;
  });

  it( "should apply provided serverUrl", function() {
    RisePlayerConfiguration.LocalMessaging.configure({ player: "electron", connectionType: "websocket", detail: { serverUrl: "http://localhost:8080" } });
    expect( socketInstance.url ).to.equal( "http://localhost:8080" );
  });

  it( "should try to connect for 20 seconds before sending connection status event", function( done ) {
    var connectionHandler = function( evt ) {
      expect( RisePlayerConfiguration.LocalMessaging.isConnected()).to.be.false;
      expect( evt.detail ).to.deep.equal({ isConnected: false });

      window.removeEventListener( "rise-local-messaging-connection", connectionHandler );

      done();
    };

    window.addEventListener( "rise-local-messaging-connection", connectionHandler );

    RisePlayerConfiguration.LocalMessaging.configure({ player: "electron", connectionType: "websocket", detail: { serverUrl: "http://localhost:8080" } });

    clock.tick( 21000 );
  });

  it( "should send connection status event upon successful connection", function( done ) {
    var connectionHandler = function( evt ) {
        expect( RisePlayerConfiguration.LocalMessaging.isConnected()).to.be.true;
        expect( evt.detail ).to.deep.equal({ isConnected: true });

        window.removeEventListener( "rise-local-messaging-connection", connectionHandler );

        done();
      },
      call,
      handler;

    window.addEventListener( "rise-local-messaging-connection", connectionHandler );

    RisePlayerConfiguration.LocalMessaging.configure({ player: "electron", connectionType: "websocket", detail: { serverUrl: "http://localhost:8080" } });

    expect( socketInstance.open ).to.have.been.called;
    expect( socketInstance.on ).to.have.been.called;

    call = socketInstance.on.args.filter( function( call ) {
      return call[ 0 ] === "open";
    })[ 0 ];

    expect( call ).to.be.ok;

    handler = call[ 1 ];
    handler();
  });

  describe( "receiveMessages", function() {
    var messagingInternalDataHandler;

    beforeEach( function() {
      var dataHandlerRegistration;

      RisePlayerConfiguration.LocalMessaging.configure({ player: "electron", connectionType: "websocket", detail: { serverUrl: "http://localhost:8080" } });

      dataHandlerRegistration = socketInstance.on.args.filter( function( call ) {
        return call[ 0 ] === "data";
      })[ 0 ];
      messagingInternalDataHandler = dataHandlerRegistration[ 1 ];
    });

    it( "should execute handler when message is received", function() {
      var spy = sinon.spy();

      RisePlayerConfiguration.LocalMessaging.receiveMessages( spy );
      messagingInternalDataHandler({ topic: "TEST" });

      expect( spy ).to.be.calledWith({ topic: "TEST" });
    });

    it( "should not execute handler when message is received without a topic", function() {
      var spy = sinon.spy();

      RisePlayerConfiguration.LocalMessaging.receiveMessages( spy );
      messagingInternalDataHandler({ test: "TEST" });

      expect( spy ).to.not.have.been.called;
    });
  });

  describe( "broadcastMessage", function() {
    beforeEach( function() {
      RisePlayerConfiguration.LocalMessaging.configure({ player: "electron", connectionType: "websocket", detail: { serverUrl: "http://localhost:8080" } });
    });

    it( "should not attempt to post to player if no message provided", function() {
      RisePlayerConfiguration.LocalMessaging.broadcastMessage();

      expect( socketInstance.write ).to.not.have.been.called;
    });

    it( "should not attempt to broadcast if no connection available", function() {
      RisePlayerConfiguration.LocalMessaging.broadcastMessage({ topic: "TEST" });

      expect( socketInstance.write ).to.not.have.been.called;
    });

    it( "should broadcast message to player with default client name", function() {
      var call = socketInstance.on.args.filter( function( call ) {
          return call[ 0 ] === "open";
        })[ 0 ],
        handler = call[ 1 ];

      handler();

      RisePlayerConfiguration.LocalMessaging.broadcastMessage({ topic: "TEST" });

      expect( socketInstance.write ).to.have.been.calledWith({ topic: "TEST", from: "ws-client" });
    });

    it( "should broadcast message to player with configured client name", function() {
      var call,
        handler;

      RisePlayerConfiguration.LocalMessaging.configure({ player: "electron", connectionType: "websocket", detail: { clientName: "test-client", serverUrl: "http://localhost:8080" } });

      call = socketInstance.on.args.filter( function( call ) {
        return call[ 0 ] === "open";
      })[ 0 ];
      handler = call[ 1 ];

      handler();

      RisePlayerConfiguration.LocalMessaging.broadcastMessage({ topic: "TEST" });

      expect( socketInstance.write ).to.have.been.calledWith({ topic: "TEST", from: "test-client" });
    });

    it( "should be able to handle a String for message param", function() {
      var call = socketInstance.on.args.filter( function( call ) {
          return call[ 0 ] === "open";
        })[ 0 ],
        handler = call[ 1 ];

      handler();

      RisePlayerConfiguration.LocalMessaging.broadcastMessage( "TEST" );

      expect( socketInstance.write ).to.have.been.calledWith({ msg: "TEST", from: "ws-client" });
    });

  });

});
