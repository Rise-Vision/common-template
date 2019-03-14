/* global describe, it, expect, afterEach, beforeEach */

"use strict";

describe( "RisePlayerConfiguration", function() {

  var _helpers,
    _localMessaging,
    _logger;

  beforeEach( function() {
    _helpers = RisePlayerConfiguration.Helpers;
    _logger = RisePlayerConfiguration.Logger;
    _localMessaging = RisePlayerConfiguration.LocalMessaging;

    RisePlayerConfiguration.Helpers = {
      isTestEnvironment: _helpers.isTestEnvironment
    };

    RisePlayerConfiguration.Logger = {
      configure: function() {}
    };

    RisePlayerConfiguration.LocalMessaging = {
      configure: function() {}
    };
  });

  afterEach( function() {
    RisePlayerConfiguration.Helpers = _helpers;
    RisePlayerConfiguration.Logger = _logger;
    RisePlayerConfiguration.LocalMessaging = _localMessaging;
  });

  describe( "isConfigured", function() {

    beforeEach( function() {
      RisePlayerConfiguration.getPlayerInfo = undefined;
    });

    it( "should not be configured if configure() function has not been called", function() {
      expect( RisePlayerConfiguration.isConfigured()).to.be.false;
    });

    it( "should be configured if configure() function has been called", function() {
      RisePlayerConfiguration.configure({ displayId: "id" });

      expect( RisePlayerConfiguration.isConfigured()).to.be.true;
    });

  });

  describe( "getPlayerInfo", function() {

    it( "should return the player info", function() {
      RisePlayerConfiguration.configure({ displayId: "id" });

      expect( RisePlayerConfiguration.getPlayerInfo()).to.deep.equal({
        displayId: "id"
      });
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

  });

  describe( "getPresentationId", function() {

    it( "should return the presentation id", function() {
      RisePlayerConfiguration.configure({ presentationId: "id" });

      expect( RisePlayerConfiguration.getPresentationId()).to.equal( "id" );
    });

    it( "should not return the presentation id if it was not provided", function() {
      RisePlayerConfiguration.Helpers.getHttpParameter = function() {
        return null;
      }

      RisePlayerConfiguration.configure({});

      expect( RisePlayerConfiguration.getPresentationId()).to.be.null;
    });

    it( "should return the presentation id if it's available as HTTP parameter", function() {
      RisePlayerConfiguration.Helpers.getHttpParameter = function() {
        return "id";
      }

      RisePlayerConfiguration.configure({});

      expect( RisePlayerConfiguration.getPresentationId()).to.equal( "id" );
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

  describe( "player injected getRisePlayerConfiguration", function() {

    beforeEach( function() {
      window.getRisePlayerConfiguration = function() {
        return {
          playerInfo: {
            displayId: "ABC",
            companyId: "123"
          },
          localMessagingInfo: {}
        }
      }
    });

    afterEach( function() {
      window.getRisePlayerConfiguration = undefined;
    });

    it( "should use player injected configuration if no arguments were provided to configure() function", function() {
      RisePlayerConfiguration.configure();

      expect( RisePlayerConfiguration.isConfigured()).to.be.true;

      expect( RisePlayerConfiguration.getPlayerInfo()).to.deep.equal({
        displayId: "ABC", companyId: "123"
      });

      expect( RisePlayerConfiguration.getDisplayId()).to.equal( "ABC" );
      expect( RisePlayerConfiguration.getCompanyId()).to.equal( "123" );
    });

  });

});
