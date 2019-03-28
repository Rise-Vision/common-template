/* eslint-disable one-var, vars-on-top */
/* global describe, it, expect, afterEach */

"use strict";

describe( "configure", function() {

  afterEach( function() {
    RisePlayerConfiguration.Logger.reset();
  });

  it( "should not enable BQ logging if no player type is defined", function() {
    RisePlayerConfiguration.configure({}, {});

    expect( RisePlayerConfiguration.Logger.isBigQueryLoggingEnabled()).to.be.false;
  });

  it( "should not enable BQ logging if player type is not stable or beta", function() {
    RisePlayerConfiguration.configure({ playerType: "stage" }, {});

    expect( RisePlayerConfiguration.Logger.isBigQueryLoggingEnabled()).to.be.false;
  });

  it( "should not enable BQ logging if preview", function() {
    RisePlayerConfiguration.configure({
      displayId: "preview",
      companyId: "COMPANY_ID",
      playerType: "beta",
      os: "Ubuntu 64",
      playerVersion: "2018.01.01.10.00"
    }, {});

    expect( RisePlayerConfiguration.Logger.isBigQueryLoggingEnabled()).to.be.false;
  });

  it( "should configure logging during beta stage", function() {
    RisePlayerConfiguration.configure({
      displayId: "DISPLAY_ID",
      companyId: "COMPANY_ID",
      presentationId: "PRESENTATION_ID",
      playerType: "beta",
      os: "Ubuntu 64",
      playerVersion: "2018.01.01.10.00"
    }, {});

    expect( RisePlayerConfiguration.Logger.isBigQueryLoggingEnabled()).to.be.true;
    expect( RisePlayerConfiguration.Logger.isDebugEnabled()).to.be.false;
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
      },
      "template": {
        "product_code": "TEMPLATE_PRODUCT_CODE",
        "version": "TEMPLATE_VERSION",
        "name": "TEMPLATE_NAME",
        "presentation_id": "PRESENTATION_ID"
      }
    });
  });

  it( "should configure logging during stable stage", function() {
    RisePlayerConfiguration.configure({
      displayId: "DISPLAY_ID",
      companyId: "COMPANY_ID",
      presentationId: "PRESENTATION_ID",
      playerType: "stable",
      os: "Ubuntu 64",
      playerVersion: "2018.01.01.10.00"
    }, {});

    expect( RisePlayerConfiguration.Logger.isBigQueryLoggingEnabled()).to.be.true;
    expect( RisePlayerConfiguration.Logger.isDebugEnabled()).to.be.false;
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
      },
      "template": {
        "product_code": "TEMPLATE_PRODUCT_CODE",
        "version": "TEMPLATE_VERSION",
        "name": "TEMPLATE_NAME",
        "presentation_id": "PRESENTATION_ID"
      }
    });
  });

  it( "should recognize player ip and chrome version if they are provided", function() {
    RisePlayerConfiguration.configure({
      displayId: "DISPLAY_ID",
      companyId: "COMPANY_ID",
      presentationId: "PRESENTATION_ID",
      playerType: "beta",
      os: "Ubuntu 64",
      playerVersion: "2018.01.01.10.00",
      ip: "213.21.45.40",
      chromeVersion: "68.34"
    }, {});

    expect( RisePlayerConfiguration.Logger.isBigQueryLoggingEnabled()).to.be.true;
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
      },
      "template": {
        "product_code": "TEMPLATE_PRODUCT_CODE",
        "version": "TEMPLATE_VERSION",
        "name": "TEMPLATE_NAME",
        "presentation_id": "PRESENTATION_ID"
      }
    });
  });

  it( "should apply empty string fallback for TEMPLATE_PRODUCT_CODE or TEMPLATE_VERSION when they are not injected", function() {
    window.mockNoInjectedConstants();

    RisePlayerConfiguration.configure({
      displayId: "DISPLAY_ID",
      companyId: "COMPANY_ID",
      presentationId: "PRESENTATION_ID",
      playerType: "stable",
      os: "Ubuntu 64",
      playerVersion: "2018.01.01.10.00"
    }, {});

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
      },
      "template": {
        "product_code": "",
        "version": "",
        "name": "",
        "presentation_id": "PRESENTATION_ID"
      }
    });

    window.resetInjectedConstants();
  });

  it( "should fail if player version is not provided", function() {
    try {
      RisePlayerConfiguration.configure({
        displayId: "DISPLAY_ID",
        companyId: "COMPANY_ID",
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
        displayId: "DISPLAY_ID",
        companyId: "COMPANY_ID",
        playerType: "beta",
        playerVersion: "2018.01.01.10.00"
      }, {});

      expect.fail();
    } catch ( error ) {
      expect( error.message ).to.equal( "No operating system was provided" );
    }
  });

  it( "should fail if display id is not provided", function() {
    try {
      RisePlayerConfiguration.configure({
        companyId: "COMPANY_ID",
        playerType: "beta",
        playerVersion: "2018.01.01.10.00",
        os: "Ubuntu 64"
      }, {});

      expect.fail();
    } catch ( error ) {
      expect( error.message ).to.equal( "No display id was provided" );
    }
  });

  it( "should fail if company id is not provided", function() {
    try {
      RisePlayerConfiguration.configure({
        displayId: "DISPLAY_ID",
        playerType: "beta",
        playerVersion: "2018.01.01.10.00",
        os: "Ubuntu 64"
      }, {});

      expect.fail();
    } catch ( error ) {
      expect( error.message ).to.equal( "No company id was provided" );
    }
  });

  it( "should enable debug logs", function() {
    RisePlayerConfiguration.configure({
      debug: true,
      displayId: "DISPLAY_ID",
      companyId: "COMPANY_ID",
      playerType: "stable",
      os: "Ubuntu 64",
      playerVersion: "2018.01.01.10.00"
    }, {});

    expect( RisePlayerConfiguration.Logger.isBigQueryLoggingEnabled()).to.be.true;
    expect( RisePlayerConfiguration.Logger.isDebugEnabled()).to.be.true;
  });

  it( "should explicitly disable debug logs", function() {
    RisePlayerConfiguration.configure({
      debug: false,
      displayId: "DISPLAY_ID",
      companyId: "COMPANY_ID",
      playerType: "stable",
      os: "Ubuntu 64",
      playerVersion: "2018.01.01.10.00"
    }, {});

    expect( RisePlayerConfiguration.Logger.isBigQueryLoggingEnabled()).to.be.true;
    expect( RisePlayerConfiguration.Logger.isDebugEnabled()).to.be.false;
  });

});
