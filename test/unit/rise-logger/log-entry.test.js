/* eslint-disable one-var, quotes, vars-on-top */
/* global describe, it, expect, afterEach, beforeEach, sinon */

"use strict";

describe( "log-entry", function() {

  var sandbox,
    COMPONENT_DATA = {
      "id": "rise-data-image-01",
      "name": "rise-data-image",
      "version": "2018.01.01.10.00"
    };

  beforeEach( function() {
    RisePlayerConfiguration.getPlayerInfo = undefined;

    sandbox = sinon.sandbox.create();
    sandbox.stub( RisePlayerConfiguration.Helpers, "getWaitForPlayerURLParam" ).returns( false );
  });

  afterEach( function() {
    RisePlayerConfiguration.getPlayerInfo = undefined;
    RisePlayerConfiguration.Logger.reset();

    sandbox.restore();
  });

  describe( "_createLogEntryFor", function() {

    beforeEach( function( done ) {
      RisePlayerConfiguration.configure({
        displayId: "DISPLAY_ID",
        companyId: "COMPANY_ID",
        presentationId: "PRESENTATION_ID",
        playerType: "beta",
        os: "Ubuntu 64",
        playerVersion: "2018.01.01.10.00",
        ip: "213.21.45.40",
        chromeVersion: "68.34"
      }, {
        player: "chromeos",
        connectionType: "window"
      });

      // need to account for delay of Promise resolve from RisePurgeCacheFiles.purge() call
      setTimeout( function() {
        done();
      }, 200 );
    });

    it( "should complete the log entry with the predefined values", function() {
      var entry = RisePlayerConfiguration.Logger.createLogEntryFor( COMPONENT_DATA, {
        "level": "info",
        "event": "test event",
        "event_details": "test data"
      });

      expect( entry ).to.have.property( "ts" );

      delete entry.ts;

      expect( entry ).to.deep.equal({
        "platform": "content",
        "source": "rise-data-image",
        "version": "2018.01.01.10.00",
        "rollout_stage": "beta",
        "display_id": "DISPLAY_ID",
        "company_id": "COMPANY_ID",
        "level": "info",
        "event": "test event",
        "event_details": "test data",
        "player": {
          "type": "chromeos",
          "ip": "213.21.45.40",
          "version": "2018.01.01.10.00",
          "os": "Ubuntu 64",
          "chrome_version": "68.34"
        },
        "component": {
          "id": "rise-data-image-01"
        },
        "template": {
          "product_code": "TEMPLATE_PRODUCT_CODE",
          "version": "TEMPLATE_VERSION",
          "name": "TEMPLATE_NAME",
          "presentation_id": "PRESENTATION_ID"
        }
      });
    });

    it( "should convert event_details to a string if it's an object", function() {
      var entry = RisePlayerConfiguration.Logger.createLogEntryFor( COMPONENT_DATA, {
        "level": "info",
        "event": "test event",
        "event_details": { "content": "test data" }
      });

      expect( entry ).to.have.property( "ts" );

      delete entry.ts;

      expect( entry ).to.deep.equal({
        "platform": "content",
        "source": "rise-data-image",
        "version": "2018.01.01.10.00",
        "rollout_stage": "beta",
        "display_id": "DISPLAY_ID",
        "company_id": "COMPANY_ID",
        "level": "info",
        "event": "test event",
        "event_details": '{"content":"test data"}',
        "player": {
          "type": "chromeos",
          "ip": "213.21.45.40",
          "version": "2018.01.01.10.00",
          "os": "Ubuntu 64",
          "chrome_version": "68.34"
        },
        "component": {
          "id": "rise-data-image-01"
        },
        "template": {
          "product_code": "TEMPLATE_PRODUCT_CODE",
          "version": "TEMPLATE_VERSION",
          "name": "TEMPLATE_NAME",
          "presentation_id": "PRESENTATION_ID"
        }
      });
    });

    it( "should not include event details if it's not provided", function() {
      var entry = RisePlayerConfiguration.Logger.createLogEntryFor( COMPONENT_DATA, {
        "level": "info",
        "event": "test event"
      });

      expect( entry ).to.have.property( "ts" );

      delete entry.ts;

      expect( entry ).to.deep.equal({
        "platform": "content",
        "source": "rise-data-image",
        "version": "2018.01.01.10.00",
        "rollout_stage": "beta",
        "display_id": "DISPLAY_ID",
        "company_id": "COMPANY_ID",
        "level": "info",
        "event": "test event",
        "player": {
          "type": "chromeos",
          "ip": "213.21.45.40",
          "version": "2018.01.01.10.00",
          "os": "Ubuntu 64",
          "chrome_version": "68.34"
        },
        "component": {
          "id": "rise-data-image-01"
        },
        "template": {
          "product_code": "TEMPLATE_PRODUCT_CODE",
          "version": "TEMPLATE_VERSION",
          "name": "TEMPLATE_NAME",
          "presentation_id": "PRESENTATION_ID"
        }
      });
    });

    it( "should set null event details if it's null", function() {
      var entry = RisePlayerConfiguration.Logger.createLogEntryFor( COMPONENT_DATA, {
        "level": "info",
        "event": "test event",
        "event_details": null
      });

      expect( entry ).to.have.property( "ts" );

      delete entry.ts;

      expect( entry ).to.deep.equal({
        "platform": "content",
        "source": "rise-data-image",
        "version": "2018.01.01.10.00",
        "rollout_stage": "beta",
        "display_id": "DISPLAY_ID",
        "company_id": "COMPANY_ID",
        "level": "info",
        "event": "test event",
        "event_details": null,
        "player": {
          "type": "chromeos",
          "ip": "213.21.45.40",
          "version": "2018.01.01.10.00",
          "os": "Ubuntu 64",
          "chrome_version": "68.34"
        },
        "component": {
          "id": "rise-data-image-01"
        },
        "template": {
          "product_code": "TEMPLATE_PRODUCT_CODE",
          "version": "TEMPLATE_VERSION",
          "name": "TEMPLATE_NAME",
          "presentation_id": "PRESENTATION_ID"
        }
      });
    });

  });

});
