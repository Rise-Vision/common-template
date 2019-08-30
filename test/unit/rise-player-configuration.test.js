/* global describe, it, expect, afterEach, beforeEach */

"use strict";

describe( "RisePlayerConfiguration", function() {

  var _helpers,
    _localMessaging,
    _logger,
    _sandbox,
    _clock;

  beforeEach( function() {
    _sandbox = sinon.sandbox.create();
    _clock = sinon.useFakeTimers();

    RisePlayerConfiguration.getPlayerInfo = undefined;
    _helpers = RisePlayerConfiguration.Helpers;
    _logger = RisePlayerConfiguration.Logger;
    _localMessaging = RisePlayerConfiguration.LocalMessaging;

    RisePlayerConfiguration.Helpers = {
      isInViewer: _helpers.isInViewer,
      isTestEnvironment: _helpers.isTestEnvironment,
      getRisePlayerConfiguration: _helpers.getRisePlayerConfiguration,
      getWaitForPlayerURLParam: _helpers.getWaitForPlayerURLParam
    };

    RisePlayerConfiguration.Logger = {
      configure: function() {},
      info: function() {}
    };

    RisePlayerConfiguration.LocalMessaging = {
      configure: function() {}
    };

    _sandbox.stub( RisePlayerConfiguration.Helpers, "getWaitForPlayerURLParam" ).returns( false );
  });

  afterEach( function() {
    _sandbox.restore();
    _clock.restore();

    RisePlayerConfiguration.getPlayerInfo = undefined;
    RisePlayerConfiguration.Helpers = _helpers;
    RisePlayerConfiguration.Logger = _logger;
    RisePlayerConfiguration.LocalMessaging = _localMessaging;
  });

  describe( "isConfigured", function() {

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

    afterEach( function() {
      window.getRisePlayerConfiguration = undefined;
    });

    it( "should be able to call getDisplayId even if it's not configured", function() {
      expect( RisePlayerConfiguration.getDisplayId()).to.equal( "preview" );
    });

    it( "should get the display id even if it's not configured", function() {
      window.getRisePlayerConfiguration = function() {
        return {
          playerInfo: {
            displayId: "ABC",
            companyId: "123"
          },
          localMessagingInfo: {}
        }
      }

      expect( RisePlayerConfiguration.getDisplayId()).to.equal( "ABC" );
    });

    it( "should detect is preview when it's not configured and player info has no display id", function() {
      window.getRisePlayerConfiguration = function() {
        return {
          playerInfo: {},
          localMessagingInfo: {}
        }
      }

      expect( RisePlayerConfiguration.getDisplayId()).to.equal( "preview" );
    });

    it( "should return the display id", function() {
      RisePlayerConfiguration.configure({ displayId: "id" });

      expect( RisePlayerConfiguration.getDisplayId()).to.equal( "id" );
    });

    it( "should return 'preview' as the value of display id if display id was not provided", function() {
      RisePlayerConfiguration.configure({});

      expect( RisePlayerConfiguration.getDisplayId()).to.equal( "preview" );
    });

  });

  describe( "getCompanyId", function() {

    afterEach( function() {
      window.getRisePlayerConfiguration = undefined;
    });

    it( "should be able to call getCompanyId even if it's not configured", function() {
      expect( RisePlayerConfiguration.getCompanyId()).to.be.null;
    });

    it( "should get the display id even if it's not configured", function() {
      window.getRisePlayerConfiguration = function() {
        return {
          playerInfo: {
            displayId: "ABC",
            companyId: "123"
          },
          localMessagingInfo: {}
        }
      }

      expect( RisePlayerConfiguration.getCompanyId()).to.equal( "123" );
    });

    it( "should not return company id when it's not configured and player info has no company id", function() {
      window.getRisePlayerConfiguration = function() {
        return {
          playerInfo: {},
          localMessagingInfo: {}
        }
      }

      expect( RisePlayerConfiguration.getCompanyId()).to.be.falsey;
    });

    it( "should return the company id", function() {
      RisePlayerConfiguration.configure({ companyId: "id" });

      expect( RisePlayerConfiguration.getCompanyId()).to.equal( "id" );
    });

    it( "should not return the company id if it was not provided", function() {
      RisePlayerConfiguration.configure({});

      expect( RisePlayerConfiguration.getCompanyId()).to.be.undefined;
    });

  });

  describe( "getPresentationId", function() {

    afterEach( function() {
      window.getRisePlayerConfiguration = undefined;
    });

    it( "should be able to call getPresentationId even if it's not configured", function() {
      RisePlayerConfiguration.Helpers.getHttpParameter = function() {
        return null;
      }

      expect( RisePlayerConfiguration.getPresentationId()).to.be.null;
    });

    it( "should get the presentation id form an HTTP param even if it's not configured", function() {
      RisePlayerConfiguration.Helpers.getHttpParameter = function() {
        return "id";
      }

      expect( RisePlayerConfiguration.getPresentationId()).to.equal( "id" );
    });

    it( "should get the presentation id even if it's not configured", function() {
      window.getRisePlayerConfiguration = function() {
        return {
          playerInfo: {
            presentationId: "id"
          },
          localMessagingInfo: {}
        }
      }

      expect( RisePlayerConfiguration.getPresentationId()).to.equal( "id" );
    });

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

    afterEach( function() {
      window.getRisePlayerConfiguration = undefined;
    });

    it( "should be able to call preview even if it's not configured", function() {
      expect( RisePlayerConfiguration.isPreview()).to.be.true;
    });

    it( "should detect it's preview even if it's not configured", function() {
      window.getRisePlayerConfiguration = function() {
        return {
          playerInfo: {
            displayId: "preview",
            companyId: "123"
          },
          localMessagingInfo: {}
        }
      }

      expect( RisePlayerConfiguration.isPreview()).to.be.true;
    });

    it( "should detect it's not preview even if it's not configured", function() {
      window.getRisePlayerConfiguration = function() {
        return {
          playerInfo: {
            displayId: "ABC",
            companyId: "123"
          },
          localMessagingInfo: {}
        }
      }

      expect( RisePlayerConfiguration.isPreview()).to.be.false;
    });

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

  describe( "getChromeVersion", function() {

    afterEach( function() {
      window.getRisePlayerConfiguration = undefined;
    });

    it( "should be able to call getChromeVersion even if it's not configured", function() {
      expect( RisePlayerConfiguration.getChromeVersion()).to.be.null;
    });

    it( "should get the chrome version even if it's not configured", function() {
      window.getRisePlayerConfiguration = function() {
        return {
          playerInfo: {
            chromeVersion: "1233"
          },
          localMessagingInfo: {}
        }
      }

      expect( RisePlayerConfiguration.getChromeVersion()).to.equal( "1233" );
    });

    it( "should return the chrome version", function() {
      RisePlayerConfiguration.configure({ chromeVersion: "1234" });

      expect( RisePlayerConfiguration.getChromeVersion()).to.equal( "1234" );
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
      };
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

    it( "should wait for player injected configuration when waitForPlayer URL param is set", function( done ) {
      delete window.getRisePlayerConfiguration;
      RisePlayerConfiguration.Helpers.getWaitForPlayerURLParam.returns( true );

      RisePlayerConfiguration.configure();

      _clock.tick( 50 );

      window.getRisePlayerConfiguration = function() {
        return {
          playerInfo: {
            displayId: "ABC",
            companyId: "123"
          },
          localMessagingInfo: {}
        }
      };

      _clock.tick( 150 );

      expect( RisePlayerConfiguration.isConfigured()).to.be.true;

      expect( RisePlayerConfiguration.getPlayerInfo()).to.deep.equal({
        displayId: "ABC", companyId: "123"
      });

      expect( RisePlayerConfiguration.getDisplayId()).to.equal( "ABC" );
      expect( RisePlayerConfiguration.getCompanyId()).to.equal( "123" );

      done();
    });

  });

  describe( "sendComponentsReadyEvent", function() {

    beforeEach( function() {
      _sandbox.stub( RisePlayerConfiguration, "dispatchWindowEvent" );
      _sandbox.stub( RisePlayerConfiguration.AttributeDataWatch, "watchAttributeDataFile" );
      _sandbox.stub( RisePlayerConfiguration.Preview, "startListeningForData" );
    });

    it( "should start listening for data if it's preview", function() {
      _sandbox.stub( RisePlayerConfiguration, "isPreview" ).returns( true );

      return RisePlayerConfiguration.sendComponentsReadyEvent()
        .then( function() {
          RisePlayerConfiguration.dispatchWindowEvent.should.have.been.called.once;
          RisePlayerConfiguration.dispatchWindowEvent.should.have.been.calledWith( "rise-components-ready" );

          RisePlayerConfiguration.Preview.startListeningForData.should.have.been.called;
          RisePlayerConfiguration.AttributeDataWatch.watchAttributeDataFile.should.not.have.been.called;
        });
    });

    it( "should watch attribute data file if it's not preview", function() {
      _sandbox.stub( RisePlayerConfiguration, "isPreview" ).returns( false );

      return RisePlayerConfiguration.sendComponentsReadyEvent()
        .then( function() {
          RisePlayerConfiguration.dispatchWindowEvent.should.have.been.called.once;
          RisePlayerConfiguration.dispatchWindowEvent.should.have.been.calledWith( "rise-components-ready" );

          RisePlayerConfiguration.Preview.startListeningForData.should.not.have.been.called;
          RisePlayerConfiguration.AttributeDataWatch.watchAttributeDataFile.should.have.been.called;
        });
    });

  });

  describe( "Viewer configuration", function() {

    beforeEach( function() {
      _sandbox.stub( RisePlayerConfiguration.Viewer, "startListeningForData" );
    });

    it( "should configure viewer", function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "isInViewer" ).returns( true );

      RisePlayerConfiguration.configure();

      RisePlayerConfiguration.Viewer.startListeningForData.should.have.been.called;
    });

    it( "should configure DOMContentLoaded to send rise-presentation-play when not on viewer", function( done ) {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "isInViewer" ).returns( false );

      var connectionHandler = function() {
        window.removeEventListener( "rise-components-ready", connectionHandler );

        done();
      };

      window.addEventListener( "rise-components-ready", connectionHandler );

      RisePlayerConfiguration.configure();

      RisePlayerConfiguration.Viewer.startListeningForData.should.not.have.been.called;

      RisePlayerConfiguration.dispatchWindowEvent( "DOMContentLoaded" );
    });

  });

});
