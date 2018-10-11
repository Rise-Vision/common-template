/* global describe, it, expect, afterEach */

"use strict";

describe( "logger configuration", function() {

  afterEach( function() {
    RisePlayerConfiguration.Logger.reset();
  });

  describe( "onceClientsAreAvailable", function() {
    it( "should not enable BQ logging if no player type is defined", function() {
      RisePlayerConfiguration.configure({}, {});

      expect( RisePlayerConfiguration.Logger.logsToBq()).to.be.false;
    });
  });

});
