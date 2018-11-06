/* eslint-disable vars-on-top */
/* global describe, it, expect, afterEach, beforeEach, sinon */

"use strict";

describe( "Heartbeat", function() {

  // var INTERVAL = 3580000,
  //   clock;

  beforeEach( function() {
    sinon.spy( RisePlayerConfiguration.LocalMessaging, "broadcastMessage" );
  });

  afterEach( function() {
    RisePlayerConfiguration.Heartbeat.reset();
    RisePlayerConfiguration.LocalMessaging.broadcastMessage.restore();
  });

  it( "should send heartbeat immediately", function() {
    RisePlayerConfiguration.Heartbeat.startHeartbeatInterval();

    var call = RisePlayerConfiguration.LocalMessaging.broadcastMessage.getCall( 0 );

    expect( RisePlayerConfiguration.LocalMessaging.broadcastMessage.calledOnce ).to.be.true;
    expect( call.args[ 0 ]).to.deep.equal({ topic: "heartbeat" });
  });

});
