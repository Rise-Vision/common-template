/* eslint-disable one-var, vars-on-top */
/* global describe, it, expect, after, afterEach, before, beforeEach, sinon */

"use strict";

describe( "Big Query logging", function() {

  var SAMPLE_FULL_PARAMETERS = {
      "ts": "2018-10-12T17:29:57.225Z",
      "platform": "content",
      "source": "rise-data-image",
      "version": "2018.01.01.10.00",
      "rollout_stage": "beta",
      "display_id": "TEST_DISPLAY_ID",
      "company_id": "TEST_COMPANY_ID",
      "level": "info",
      "event": "test event",
      "event_details": "",
      "player": {
        "ip": null,
        "version": "2018.01.02.14.00",
        "os": "Ubuntu 64",
        "chrome_version": "69.12"
      },
      "component": {
        "id": "rise-data-image-01"
      }
    },
    INTERVAL = 3580000,
    clock;

  afterEach( function() {
    RisePlayerConfiguration.Logger.reset();
  });

  describe( "getInsertData", function() {
    var data = null;

    before( function() {
      data = RisePlayerConfiguration.Logger.getInsertData( SAMPLE_FULL_PARAMETERS );
    });

    it( "should return an object containing a rows array", function() {
      expect( data.rows ).to.exist;
      expect( data.rows ).to.be.a( "array" );
      expect( data.rows.length ).to.equal( 1 );
    });

    it( "should return an object containing insertId property", function() {
      expect( data.rows[ 0 ].insertId ).to.exist;
      expect( data.rows[ 0 ].insertId ).to.be.a( "string" );
    });

    it( "should return an object containing the provided properties", function() {
      expect( data.rows[ 0 ].json ).to.exist;
      expect( data.rows[ 0 ].json ).to.deep.equal( SAMPLE_FULL_PARAMETERS );
    });

  });

  describe( "logToBigQuery", function() {
    var TOKEN = "my-token",
      TOKEN_DATA = { "access_token": TOKEN },
      TOKEN_JSON = JSON.stringify( TOKEN_DATA ),
      xhr,
      requests;

    before( function() {
      xhr = sinon.useFakeXMLHttpRequest();

      xhr.onCreate = function( xhr ) {
        requests.push( xhr );
      };

      clock = sinon.useFakeTimers();
    });

    beforeEach( function() {
      requests = [];

      clock.tick( INTERVAL );
      RisePlayerConfiguration.Logger.logToBigQuery( SAMPLE_FULL_PARAMETERS );

      // Respond to refresh token request.
      requests[ 0 ].respond( 200, { "Content-Type": "text/json" }, TOKEN_JSON );
    });

    after( function() {
      xhr.restore();
      clock.restore();
    });

    it( "should make a POST request", function() {
      expect( requests[ 1 ].method ).to.equal( "POST" );
    });

    it( "should make a request to the correct URL", function() {
      var expectedUrl = "https://www.googleapis.com/bigquery/v2/projects/client-side-events/datasets/Display_Events/tables/events_test/insertAll";

      expect( requests[ 1 ].url ).to.equal( expectedUrl );
    });

    it( "should set the Content-Type header", function() {
      var contentType = requests[ 1 ].requestHeaders[ "Content-Type" ];

      expect( contentType ).to.equal( "application/json;charset=utf-8" );
    });

    it( "should set the Authorization header", function() {
      var authorization = requests[ 1 ].requestHeaders.Authorization;

      expect( authorization ).to.equal( "Bearer " + TOKEN );
    });

    it( "should send string data in the body", function() {
      var body = requests[ 1 ].requestBody;

      expect( body ).to.be.a( "string" );

      var content = JSON.parse( body );

      expect( content.kind ).to.equal( "bigquery#tableDataInsertAllRequest" );
      expect( content.skipInvalidRows ).to.be.false;
      expect( content.rows ).to.exist;

      var row = content.rows[ 0 ];

      expect( row.insertId ).to.exist;
      expect( row.json ).to.deep.equal( SAMPLE_FULL_PARAMETERS );
    });

    it( "should not make a request if no params provided", function() {
      requests = [];

      clock.tick( INTERVAL );
      RisePlayerConfiguration.Logger.logToBigQuery();

      expect( requests.length ).to.equal( 0 );
    });

    it( "should not make a request if event is empty", function() {
      requests = [];

      var row = JSON.parse( JSON.stringify( SAMPLE_FULL_PARAMETERS ));

      row.event = "";

      clock.tick( INTERVAL );
      RisePlayerConfiguration.Logger.logToBigQuery( row );

      expect( requests.length ).to.equal( 0 );
    });

    it( "should not log the same event multiple times if the time between calls is less than 1 second", function() {
      requests = [];

      RisePlayerConfiguration.Logger.logToBigQuery( SAMPLE_FULL_PARAMETERS );

      expect( requests.length ).to.equal( 0 );
    });

    it( "should log the same event multiple times if the time between calls is 1.5 seconds", function() {
      requests = [];

      clock.tick( 1500 );
      RisePlayerConfiguration.Logger.logToBigQuery( SAMPLE_FULL_PARAMETERS );

      // Refresh token request + insert request
      expect( requests.length ).to.equal( 2 );
    });

    it( "should log different events if the time between calls is less than 1 second", function() {
      requests = [];

      var row = JSON.parse( JSON.stringify( SAMPLE_FULL_PARAMETERS ));

      row.event = "another event";

      RisePlayerConfiguration.Logger.logToBigQuery( row );

      // Refresh token request + insert request
      expect( requests.length ).to.equal( 2 );
    });

  });

});
