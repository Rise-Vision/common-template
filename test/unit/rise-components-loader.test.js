
/* global describe, it, expect, afterEach, beforeEach, sinon */

"use strict";

describe( "ComponentLoader", function() {

  afterEach( function() {
    delete top.postToPlayer;
    delete top.receiveFromPlayer;
  });

  it( "should always invoke the action in ChromeOS player", function() {
    var spy = sinon.spy();

    RisePlayerConfiguration.configure({ playerType: "beta" });

    RisePlayerConfiguration.ComponentLoader.onceClientsAreAvailable( "local-storage", spy );

    expect( spy ).to.have.been.called;
  });

});
