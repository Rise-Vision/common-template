/* eslint-disable vars-on-top */
/* global describe, it, expect, after, afterEach, before, beforeEach, sinon */

"use strict";

describe( "Heartbeat", function() {

  beforeEach( function() {
    sinon.spy( RisePlayerConfiguration.LocalMessaging, "broadcastMessage" );
  });

  afterEach( function() {
    RisePlayerConfiguration.LocalMessaging.broadcastMessage.restore();
  });

  describe( "Immediate", function() {

    afterEach( function() {
      RisePlayerConfiguration.Heartbeat.reset();
    });

    it( "should send heartbeat immediately", function() {
      RisePlayerConfiguration.Heartbeat.startHeartbeatInterval();

      expect( RisePlayerConfiguration.LocalMessaging.broadcastMessage.calledOnce ).to.be.true;

      var call = RisePlayerConfiguration.LocalMessaging.broadcastMessage.getCall( 0 );

      expect( call.args[ 0 ]).to.deep.equal({ topic: "heartbeat" });
    });

  });

  describe( "Timeout", function() {

    var clock;

    before( function() {
      clock = sinon.useFakeTimers();
    });

    after( function() {
      clock.restore();
      RisePlayerConfiguration.Heartbeat.reset();
    });

    it( "should send heartbeat after an interval of time", function() {
      RisePlayerConfiguration.Heartbeat.startHeartbeatInterval();

      expect( RisePlayerConfiguration.LocalMessaging.broadcastMessage.calledOnce ).to.be.true;

      clock.tick( RisePlayerConfiguration.Heartbeat.timeout );

      expect( RisePlayerConfiguration.LocalMessaging.broadcastMessage.calledTwice ).to.be.true;

      var call = RisePlayerConfiguration.LocalMessaging.broadcastMessage.getCall( 1 );

      expect( call.args[ 0 ]).to.deep.equal({ topic: "heartbeat" });
    });

  });

});
