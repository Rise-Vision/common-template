/* global describe, it, expect, afterEach */

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
  });

});
