/* global describe, it, expect */

"use strict";

describe( "configure", function() {

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
    RisePlayerConfiguration.LocalMessaging.configure({ player: "electron", connectionType: "window" });

    expect( RisePlayerConfiguration.LocalMessaging.getConnectionType()).to.equal( "window" );
  });


});
