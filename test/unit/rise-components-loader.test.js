/* global describe, it, expect, afterEach */

"use strict";

describe( "ComponentLoader", function() {

  var rolloutEnvironment;

  afterEach( function() {
    RisePlayerConfiguration.ComponentLoader.clear();
  });

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

  it( "should not set the rollout environment if an invalid player type is provided", function() {
    RisePlayerConfiguration.configure({ playerType: "other" }, {});

    RisePlayerConfiguration.ComponentLoader.load();

    rolloutEnvironment = RisePlayerConfiguration.ComponentLoader.getRolloutEnvironment();

    expect( rolloutEnvironment ).to.be.null;
  });

  it( "should not set the rollout environment if no player type is provided", function() {
    RisePlayerConfiguration.configure({}, {});

    RisePlayerConfiguration.ComponentLoader.load();

    rolloutEnvironment = RisePlayerConfiguration.ComponentLoader.getRolloutEnvironment();

    expect( rolloutEnvironment ).to.be.null;
  });

});
