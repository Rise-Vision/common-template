
/* global describe, it, expect */

"use strict";

describe( "ComponentLoader", function() {

  var rolloutEnvironment;

  it( "should recoginize the rollout environment as beta", function() {
    RisePlayerConfiguration.configure({ playerType: "beta" }, {});

    RisePlayerConfiguration.ComponentLoader.load();

    rolloutEnvironment = RisePlayerConfiguration.ComponentLoader.getRolloutEnvironment();

    expect( rolloutEnvironment ).to.equal( "beta" );
  });

});
