/* global describe, it, expect, afterEach, beforeEach */

"use strict";

describe( "RisePlayerConfiguration", function() {

  var _localMessaging,
    _logger;

  beforeEach( function() {
    _logger = RisePlayerConfiguration.Logger;
    _localMessaging = RisePlayerConfiguration.LocalMessaging;

    RisePlayerConfiguration.Logger = {
      configure: function() {}
    };

    RisePlayerConfiguration.LocalMessaging = {
      configure: function() {}
    };
  });

  afterEach( function() {
    RisePlayerConfiguration.Logger = _logger;
    RisePlayerConfiguration.LocalMessaging = _localMessaging;
  });

  describe( "isPreview", function() {

    it( "should be preview if display id is 'preview'", function() {
      RisePlayerConfiguration.configure({ displayId: "preview" });

      expect( RisePlayerConfiguration.isPreview()).to.be.true;
    });

    it( "should not be preview if display id is not 'preview'", function() {
      RisePlayerConfiguration.configure({ displayId: "test" });

      expect( RisePlayerConfiguration.isPreview()).to.be.false;
    });

  });

});
