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

  describe( "getPlayerInfo", function() {

    it( "should return the player info", function() {
      RisePlayerConfiguration.configure({ displayId: "id" });

      expect( RisePlayerConfiguration.getPlayerInfo()).to.deep.equal({
        displayId: "id"
      });
    });

    it( "should not return the player info if there was no configuration", function() {
      RisePlayerConfiguration.configure();

      expect( RisePlayerConfiguration.getPlayerInfo()).to.be.undefined;
    });

  });

  describe( "getDisplayId", function() {

    it( "should return the display id", function() {
      RisePlayerConfiguration.configure({ displayId: "id" });

      expect( RisePlayerConfiguration.getDisplayId()).to.equal( "id" );
    });

    it( "should not return the display id if it was not provided", function() {
      RisePlayerConfiguration.configure({});

      expect( RisePlayerConfiguration.getDisplayId()).to.be.undefined;
    });

    it( "should not return the display id if there was no configuration", function() {
      RisePlayerConfiguration.configure();

      expect( RisePlayerConfiguration.getDisplayId()).to.be.null;
    });

  });

  describe( "getCompanyId", function() {

    it( "should return the company id", function() {
      RisePlayerConfiguration.configure({ companyId: "id" });

      expect( RisePlayerConfiguration.getCompanyId()).to.equal( "id" );
    });

    it( "should not return the company id if it was not provided", function() {
      RisePlayerConfiguration.configure({});

      expect( RisePlayerConfiguration.getDisplayId()).to.be.undefined;
    });

    it( "should not return the company id if there was no configuration", function() {
      RisePlayerConfiguration.configure();

      expect( RisePlayerConfiguration.getDisplayId()).to.be.null;
    });

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

    it( "should call rise-components-ready on preview", function( done ) {
      var connectionHandler = function() {
        window.removeEventListener( "rise-components-ready", connectionHandler );

        done();
      };

      window.addEventListener( "rise-components-ready", connectionHandler );

      RisePlayerConfiguration.configure({ displayId: "preview" });
    });

  });

});
