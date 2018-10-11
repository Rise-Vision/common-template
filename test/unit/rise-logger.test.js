/* global describe, it, expect, afterEach, sinon */

"use strict";

describe( "logger configuration", function() {

  afterEach( function() {
    RisePlayerConfiguration.Logger.reset();
  });

  describe( "configure", function() {
    it( "should not enable BQ logging if no player type is defined", function() {
      RisePlayerConfiguration.configure({}, {});

      expect( RisePlayerConfiguration.Logger.logsToBq()).to.be.false;
    });

    it( "should not enable BQ logging if player type is not stable or beta", function() {
      RisePlayerConfiguration.configure({ playerType: "stage" }, {});

      expect( RisePlayerConfiguration.Logger.logsToBq()).to.be.false;
    });

    it( "should configure logging during beta stage", function() {
      RisePlayerConfiguration.configure({
        playerType: "beta",
        os: "Ubuntu 64",
        playerVersion: "2018.01.01.10.00"
      }, {});

      expect( RisePlayerConfiguration.Logger.logsToBq()).to.be.true;
      expect( RisePlayerConfiguration.Logger.getCommonEntryValues()).to.deep.equal({
        "platform": "content",
        "display_id": "DISPLAY_ID",
        "company_id": "COMPANY_ID",
        "rollout_stage": "beta",
        "player": {
          "ip": null,
          "version": "2018.01.01.10.00",
          "os": "Ubuntu 64",
          "chrome_version": null
        }
      });
    });

    it( "should configure logging during stable stage", function() {
      RisePlayerConfiguration.configure({
        playerType: "stable",
        os: "Ubuntu 64",
        playerVersion: "2018.01.01.10.00"
      }, {});

      expect( RisePlayerConfiguration.Logger.logsToBq()).to.be.true;
      expect( RisePlayerConfiguration.Logger.getCommonEntryValues()).to.deep.equal({
        "platform": "content",
        "display_id": "DISPLAY_ID",
        "company_id": "COMPANY_ID",
        "rollout_stage": "stable",
        "player": {
          "ip": null,
          "version": "2018.01.01.10.00",
          "os": "Ubuntu 64",
          "chrome_version": null
        }
      });
    });

    it( "should recognize player ip and chrome version if they are provided", function() {
      RisePlayerConfiguration.configure({
        playerType: "beta",
        os: "Ubuntu 64",
        playerVersion: "2018.01.01.10.00",
        ip: "213.21.45.40",
        chromeVersion: "68.34"
      }, {});

      expect( RisePlayerConfiguration.Logger.logsToBq()).to.be.true;
      expect( RisePlayerConfiguration.Logger.getCommonEntryValues()).to.deep.equal({
        "platform": "content",
        "display_id": "DISPLAY_ID",
        "company_id": "COMPANY_ID",
        "rollout_stage": "beta",
        "player": {
          "ip": "213.21.45.40",
          "version": "2018.01.01.10.00",
          "os": "Ubuntu 64",
          "chrome_version": "68.34"
        }
      });
    });

    it( "should fail if player version is not provided", function() {
      try {
        RisePlayerConfiguration.configure({
          playerType: "beta",
          os: "Ubuntu 64"
        }, {});

        expect.fail();
      } catch ( error ) {
        expect( error.message ).to.equal( "No player version was provided" );
      }
    });

    it( "should fail if operating system is not provided", function() {
      try {
        RisePlayerConfiguration.configure({
          playerType: "beta",
          playerVersion: "2018.01.01.10.00"
        }, {});

        expect.fail();
      } catch ( error ) {
        expect( error.message ).to.equal( "No operating system was provided" );
      }
    });

    it( "should fail if display id is not provided", function() {
      var stub = sinon.stub( RisePlayerConfiguration, "getDisplayId" )
        .returns( undefined );

      try {
        RisePlayerConfiguration.configure({
          playerType: "beta",
          playerVersion: "2018.01.01.10.00",
          os: "Ubuntu 64"
        }, {});

        expect.fail();
      } catch ( error ) {
        expect( error.message ).to.equal( "No display id was provided" );
      } finally {
        stub.restore();
      }
    });

    it( "should fail if company id is not provided", function() {
      var stub = sinon.stub( RisePlayerConfiguration, "getCompanyId" )
        .returns( undefined );

      try {
        RisePlayerConfiguration.configure({
          playerType: "beta",
          playerVersion: "2018.01.01.10.00",
          os: "Ubuntu 64"
        }, {});

        expect.fail();
      } catch ( error ) {
        expect( error.message ).to.equal( "No company id was provided" );
      } finally {
        stub.restore();
      }
    });

  });

});
