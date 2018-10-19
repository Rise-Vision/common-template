/* eslint-disable one-var, vars-on-top */
/* global describe, it, expect, afterEach, before, beforeEach, sinon */

"use strict";

describe( "log-entry", function() {

  afterEach( function() {
    RisePlayerConfiguration.Logger.reset();
  });

  describe( "_createLogEntryFor", function() {

    before( sinon.useFakeTimers );

    beforeEach( function() {
      RisePlayerConfiguration.configure({
        playerType: "beta",
        os: "Ubuntu 64",
        playerVersion: "2018.01.01.10.00",
        ip: "213.21.45.40",
        chromeVersion: "68.34"
      }, {});
    });

    it( "should complete the log entry with the predefined values", function() {
      var entry = RisePlayerConfiguration.Logger.createLogEntryFor({
        "level": "info",
        "event": "test event",
        "event_details": "test data",
        "component": {
          "id": "rise-data-image-01",
          "name": "rise-data-image",
          "version": "2018.01.01.10.00"
        }
      });

      expect( entry ).to.deep.equal({
        "ts": "1970-01-01T00:00:00.000Z",
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
          "ip": "213.21.45.40",
          "version": "2018.01.01.10.00",
          "os": "Ubuntu 64",
          "chrome_version": "68.34"
        },
        "component": {
          "id": "rise-data-image-01"
        }
      });
    });

    it( "should not send event details if it's not provided", function() {
      var entry = RisePlayerConfiguration.Logger.createLogEntryFor({
        "level": "info",
        "event": "test event",
        "component": {
          "id": "rise-data-image-01",
          "name": "rise-data-image",
          "version": "2018.01.01.10.00"
        }
      });

      expect( entry ).to.deep.equal({
        "ts": "1970-01-01T00:00:00.000Z",
        "platform": "content",
        "source": "rise-data-image",
        "version": "2018.01.01.10.00",
        "rollout_stage": "beta",
        "display_id": "DISPLAY_ID",
        "company_id": "COMPANY_ID",
        "level": "info",
        "event": "test event",
        "player": {
          "ip": "213.21.45.40",
          "version": "2018.01.01.10.00",
          "os": "Ubuntu 64",
          "chrome_version": "68.34"
        },
        "component": {
          "id": "rise-data-image-01"
        }
      });
    });

    it( "should not send event details if it's null", function() {
      var entry = RisePlayerConfiguration.Logger.createLogEntryFor({
        "level": "info",
        "event": "test event",
        "event_details": null,
        "component": {
          "id": "rise-data-image-01",
          "name": "rise-data-image",
          "version": "2018.01.01.10.00"
        }
      });

      expect( entry ).to.deep.equal({
        "ts": "1970-01-01T00:00:00.000Z",
        "platform": "content",
        "source": "rise-data-image",
        "version": "2018.01.01.10.00",
        "rollout_stage": "beta",
        "display_id": "DISPLAY_ID",
        "company_id": "COMPANY_ID",
        "level": "info",
        "event": "test event",
        "player": {
          "ip": "213.21.45.40",
          "version": "2018.01.01.10.00",
          "os": "Ubuntu 64",
          "chrome_version": "68.34"
        },
        "component": {
          "id": "rise-data-image-01"
        }
      });
    });

  });

});
