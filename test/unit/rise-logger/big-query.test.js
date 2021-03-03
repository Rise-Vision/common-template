/* eslint-disable newline-after-var, one-var, vars-on-top */
/* global describe, it, expect, after, afterEach, before, beforeEach, sinon, window */

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
    clock,
    sandbox;

  beforeEach( function() {
    RisePlayerConfiguration.getPlayerInfo = undefined;

    sandbox = sinon.sandbox.create();
    sandbox.stub( RisePlayerConfiguration, "getTemplateName" ).returns( "TEMPLATE-NAME" );
    sandbox.stub( RisePlayerConfiguration, "getTemplateVersion" ).returns( "TEMPLATE-VERSION" );
    sandbox.stub( RisePlayerConfiguration.Helpers, "getWaitForPlayerURLParam" ).returns( false );
    sandbox.stub( RisePlayerConfiguration.Viewer, "sendEndpointLog" ).returns( false );
  });

  afterEach( function() {
    RisePlayerConfiguration.getPlayerInfo = undefined;
    RisePlayerConfiguration.Logger.reset();

    sandbox.restore();
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

  describe( "logging", function() {
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

    describe( "logToBigQuery", function() {

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

    describe( "log and API methods", function() {

      var COMPONENT_DATA = {
        "id": "rise-data-image-01",
        "name": "rise-data-image",
        "version": "2018.01.01.10.00"
      };

      beforeEach( function() {
        requests = [];
      });

      describe( "beta or stable default configuration", function() {

        beforeEach( function() {
          RisePlayerConfiguration.configure({
            displayId: "DISPLAY_ID",
            companyId: "COMPANY_ID",
            playerType: "beta",
            os: "Ubuntu 64",
            playerVersion: "2018.01.14.10.00",
            ip: "213.21.45.40",
            chromeVersion: "68.34"
          }, {});
        });

        it( "should log an event if all required data is provided", function() {
          RisePlayerConfiguration.Logger.log( COMPONENT_DATA, {
            "level": "info",
            "event": "disk full",
            "event_details": "test data"
          });

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "info" );
          expect( entry.event ).to.equal( "disk full" );
          expect( entry.event_details ).to.equal( "test data" );
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( COMPONENT_DATA.name );
          expect( entry.version ).to.equal( COMPONENT_DATA.version );
          expect( entry.component.id ).to.equal( COMPONENT_DATA.id );
        });

        it( "should not log debug entries by default", function() {
          RisePlayerConfiguration.Logger.log( COMPONENT_DATA, {
            "level": "debug",
            "event": "object data",
            "event_details": "test data"
          });

          expect( requests.length ).to.equal( 0 );
        });

        it( "should log a severe error if no log entry was provided", function() {
          RisePlayerConfiguration.Logger.log( COMPONENT_DATA );

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "severe" );
          expect( entry.event ).to.equal( "incomplete log parameters" );
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( COMPONENT_DATA.name );
          expect( entry.version ).to.equal( COMPONENT_DATA.version );
          expect( entry.component.id ).to.equal( COMPONENT_DATA.id );
        });

        it( "should log a severe error if no level was provided", function() {
          RisePlayerConfiguration.Logger.log( COMPONENT_DATA, {
            "event": "bad event",
            "event_details": "test data"
          });

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "severe" );
          expect( entry.event ).to.equal( "incomplete log parameters" );
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( COMPONENT_DATA.name );
          expect( entry.version ).to.equal( COMPONENT_DATA.version );
          expect( entry.component.id ).to.equal( COMPONENT_DATA.id );
        });

        it( "should log a severe error if no event was provided", function() {
          RisePlayerConfiguration.Logger.log( COMPONENT_DATA, {
            "level": "error",
            "event_details": "test data"
          });

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "severe" );
          expect( entry.event ).to.equal( "incomplete log parameters" );
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( COMPONENT_DATA.name );
          expect( entry.version ).to.equal( COMPONENT_DATA.version );
          expect( entry.component.id ).to.equal( COMPONENT_DATA.id );
        });

        it( "should log even if no event_details were provided", function() {
          RisePlayerConfiguration.Logger.log( COMPONENT_DATA, {
            "level": "error",
            "event": "noise"
          });

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );
        });

        it( "should log a severe error if no component was provided", function() {
          RisePlayerConfiguration.Logger.log({}, {
            "level": "error",
            "event": "no component"
          });

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "severe" );
          expect( entry.event ).to.equal( "invalid component data" );
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( "RisePlayerConfiguration" );
          expect( entry.version ).to.equal( "N/A" );
          expect( entry.component.id ).to.equal( "Logger" );
        });

        it( "should log a severe error if no component id was provided", function() {
          RisePlayerConfiguration.Logger.log({
            "name": "rise-data-image",
            "version": "2018.01.01.10.00"
          }, {
            "level": "error",
            "event": "no id"
          });

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "severe" );
          expect( entry.event ).to.equal( "invalid component data" );
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( "RisePlayerConfiguration" );
          expect( entry.version ).to.equal( "N/A" );
          expect( entry.component.id ).to.equal( "Logger" );
        });

        it( "should log a severe error if no component name was provided", function() {
          RisePlayerConfiguration.Logger.log({
            "id": "rise-data-image-01",
            "version": "2018.01.01.10.00"
          }, {
            "level": "error",
            "event": "no name"
          });

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "severe" );
          expect( entry.event ).to.equal( "invalid component data" );
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( "RisePlayerConfiguration" );
          expect( entry.version ).to.equal( "N/A" );
          expect( entry.component.id ).to.equal( "Logger" );
        });

        it( "should log a severe error if no component version was provided", function() {
          RisePlayerConfiguration.Logger.log({
            "id": "rise-data-image-01",
            "name": "rise-data-image"
          }, {
            "level": "error",
            "event": "no version"
          });

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "severe" );
          expect( entry.event ).to.equal( "invalid component data" );
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( "RisePlayerConfiguration" );
          expect( entry.version ).to.equal( "N/A" );
          expect( entry.component.id ).to.equal( "Logger" );
        });

        it( "should directly log a severe event", function() {
          RisePlayerConfiguration.Logger.severe( COMPONENT_DATA, "display exploded" );

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "severe" );
          expect( entry.event ).to.equal( "display exploded" );
          expect( entry.event_details ).to.equal( "" );
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( COMPONENT_DATA.name );
          expect( entry.version ).to.equal( COMPONENT_DATA.version );
          expect( entry.component.id ).to.equal( COMPONENT_DATA.id );
        });

        it( "should log an error event", function() {
          RisePlayerConfiguration.Logger.error( COMPONENT_DATA, "video download failed" );

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "error" );
          expect( entry.event ).to.equal( "video download failed" );
          expect( entry.event_details ).to.equal( "" );
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( COMPONENT_DATA.name );
          expect( entry.version ).to.equal( COMPONENT_DATA.version );
          expect( entry.component.id ).to.equal( COMPONENT_DATA.id );

          const endpointCall = RisePlayerConfiguration.Viewer.sendEndpointLog
          expect( endpointCall ).to.have.been.called;
          expect( endpointCall.lastCall.args[ 0 ].eventApp ).to.equal( COMPONENT_DATA.name );
          expect( endpointCall.lastCall.args[ 0 ].eventAppVersion ).to.equal( COMPONENT_DATA.version );
          expect( endpointCall.lastCall.args[ 0 ].componentId ).to.equal( COMPONENT_DATA.id );
        });

        it( "should call endpoint log with HTML template event app for common template component", function() {
          RisePlayerConfiguration.Logger.error({
            name: "RisePlayerConfiguration",
            id: "CommonComponent",
            version: "N/A"
          }, "common error" );

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          const endpointCall = RisePlayerConfiguration.Viewer.sendEndpointLog
          expect( endpointCall ).to.have.been.called;
          expect( endpointCall.lastCall.args[ 0 ].eventApp ).to.equal( "HTML Template: TEMPLATE-NAME" );
          expect( endpointCall.lastCall.args[ 0 ].eventAppVersion ).to.equal( "TEMPLATE-VERSION" );
          expect( endpointCall.lastCall.args[ 0 ].componentId ).to.equal( "CommonComponent" );
        });

        it( "should log an error event with event details", function() {
          RisePlayerConfiguration.Logger.error( COMPONENT_DATA, "video download failed again", "http://video.com/matrix.wmv" );

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "error" );
          expect( entry.event ).to.equal( "video download failed again" );
          expect( entry.event_details ).to.equal( JSON.stringify({ details: "http://video.com/matrix.wmv" }));
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( COMPONENT_DATA.name );
          expect( entry.version ).to.equal( COMPONENT_DATA.version );
          expect( entry.component.id ).to.equal( COMPONENT_DATA.id );
        });

        it( "should log an error event with extra parameters", function() {
          RisePlayerConfiguration.Logger.error(
            COMPONENT_DATA,
            "video download failed once more",
            "http://video.com/matrix.wmv",
            {
              "storage": { "file_path": "./videos/matrix.wmv" }
            }
          );

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "error" );
          expect( entry.event ).to.equal( "video download failed once more" );
          expect( entry.event_details ).to.equal( JSON.stringify({ details: "http://video.com/matrix.wmv" }));
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( COMPONENT_DATA.name );
          expect( entry.version ).to.equal( COMPONENT_DATA.version );
          expect( entry.component.id ).to.equal( COMPONENT_DATA.id );
          expect( entry.storage ).to.deep.equal({
            "file_path": "./videos/matrix.wmv"
          });
        });

        it( "should not log extra underscored parameters", function() {
          RisePlayerConfiguration.Logger.error(
            COMPONENT_DATA,
            "video download failed once more",
            "http://video.com/matrix.wmv",
            {
              "storage": { "file_path": "./videos/matrix.wmv" },
              "_option": "this is not a bq entry"
            }
          );

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.storage ).to.deep.equal({
            "file_path": "./videos/matrix.wmv"
          });
          expect( entry._option ).to.be.undefined;
        });

        it( "should log a severe entry if the extra parameters are not an object", function() {
          RisePlayerConfiguration.Logger.error(
            COMPONENT_DATA,
            "video player crashed",
            "http://video.com/matrix.wmv",
            "not an object"
          );

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "severe" );
          expect( entry.event ).to.equal( "invalid additional fields value" );
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( "RisePlayerConfiguration" );
          expect( entry.version ).to.equal( "N/A" );
          expect( entry.component.id ).to.equal( "Logger" );
        });

        it( "should log a warning event", function() {
          RisePlayerConfiguration.Logger.warning( COMPONENT_DATA, "possible race condition" );

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "warning" );
          expect( entry.event ).to.equal( "possible race condition" );
          expect( entry.event_details ).to.equal( "" );
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( COMPONENT_DATA.name );
          expect( entry.version ).to.equal( COMPONENT_DATA.version );
          expect( entry.component.id ).to.equal( COMPONENT_DATA.id );
        });

        it( "should log an info event", function() {
          RisePlayerConfiguration.Logger.info( COMPONENT_DATA, "component started" );

          // Refresh token request + insert request
          expect( requests.length ).to.equal( 2 );

          var body = JSON.parse( requests[ 1 ].requestBody );
          var entry = body.rows[ 0 ].json;

          expect( entry.level ).to.equal( "info" );
          expect( entry.event ).to.equal( "component started" );
          expect( entry.event_details ).to.equal( "" );
          expect( entry.platform ).to.equal( "content" );
          expect( entry.source ).to.equal( COMPONENT_DATA.name );
          expect( entry.version ).to.equal( COMPONENT_DATA.version );
          expect( entry.component.id ).to.equal( COMPONENT_DATA.id );
        });

        it( "should not log a debug event by default", function() {
          RisePlayerConfiguration.Logger.debug( COMPONENT_DATA, "low level trace" );

          expect( requests.length ).to.equal( 0 );
        });

        it( "should use the endpoint logger during log calls", function() {
          RisePlayerConfiguration.Logger.debug( COMPONENT_DATA, "low level trace" );

          expect( RisePlayerConfiguration.Viewer.sendEndpointLog ).to.have.been.called;
        });

        describe( "alreadyLogged", function() {

          var DATA;

          beforeEach( function() {
            DATA = {
              date: RisePlayerConfiguration.Logger.currentDate(),
              alreadyLogged: [
                RisePlayerConfiguration.Logger.entryKeyFor( COMPONENT_DATA, "broken" )
              ]
            };

            sinon.stub( window.sessionStorage, "setItem", function() {});
          });

          afterEach( function() {
            window.sessionStorage.setItem.restore();
            window.sessionStorage.getItem.restore();
          });

          it( "should not log an event if it was already logged", function() {

            sinon.stub( window.sessionStorage, "getItem", function() {
              return JSON.stringify( DATA );
            });

            RisePlayerConfiguration.Logger.error( COMPONENT_DATA, "broken", "", {
              _logAtMostOncePerDay: true
            });

            expect( requests.length ).to.equal( 0 );
            expect( window.sessionStorage.setItem ).to.not.have.been.called;
          });

          it( "should log an event if it was not already logged", function() {
            sinon.stub( window.sessionStorage, "getItem", function() {
              return JSON.stringify({
                date: RisePlayerConfiguration.Logger.currentDate(),
                alreadyLogged: []
              });
            });

            RisePlayerConfiguration.Logger.error( COMPONENT_DATA, "broken", "", {
              _logAtMostOncePerDay: true
            });

            expect( requests.length ).to.equal( 2 );
            expect( window.sessionStorage.setItem ).to.have.been.called;

            var call = window.sessionStorage.setItem.lastCall;
            expect( call.args[ 0 ]).to.equal( "RISE_VISION_LOGGED_ENTRIES" );

            var value = call.args[ 1 ];
            expect( value ).to.be.ok;

            var data = JSON.parse( value );
            expect( data ).to.deep.equal( DATA );
          });

          it( "should log an event if there is no stored data", function() {
            sinon.stub( window.sessionStorage, "getItem", function() {
              return null;
            });

            RisePlayerConfiguration.Logger.error( COMPONENT_DATA, "broken", "", {
              _logAtMostOncePerDay: true
            });

            expect( requests.length ).to.equal( 2 );
            expect( window.sessionStorage.setItem ).to.have.been.called;

            var call = window.sessionStorage.setItem.lastCall;
            expect( call.args[ 0 ]).to.equal( "RISE_VISION_LOGGED_ENTRIES" );

            var value = call.args[ 1 ];
            expect( value ).to.be.ok;

            var data = JSON.parse( value );
            expect( data ).to.deep.equal( DATA );
          });

          it( "should log an event if the date has changed", function() {
            sinon.stub( window.sessionStorage, "getItem", function() {
              return JSON.stringify({
                date: "other date",
                alreadyLogged: DATA.alreadyLogged
              });
            });

            RisePlayerConfiguration.Logger.error( COMPONENT_DATA, "broken", "", {
              _logAtMostOncePerDay: true
            });

            expect( requests.length ).to.equal( 2 );
            expect( window.sessionStorage.setItem ).to.have.been.called;

            var call = window.sessionStorage.setItem.lastCall;
            expect( call.args[ 0 ]).to.equal( "RISE_VISION_LOGGED_ENTRIES" );

            var value = call.args[ 1 ];
            expect( value ).to.be.ok;

            var data = JSON.parse( value );
            expect( data ).to.deep.equal( DATA );
          });

        });

      });

      it( "should disable BiqQuery logging on developer mode", function() {
        RisePlayerConfiguration.configure({
          displayId: "DISPLAY_ID",
          companyId: "COMPANY_ID",
          playerType: "developer",
          os: "Ubuntu 64",
          playerVersion: "2018.01.01.10.00",
          ip: "213.21.45.40",
          chromeVersion: "68.34"
        }, {});

        RisePlayerConfiguration.Logger.log( COMPONENT_DATA, {
          "level": "error",
          "event": "network error",
          "event_details": "test data"
        });

        expect( requests.length ).to.equal( 0 );
      });

      it( "should log debug entries if debug mode was enabled", function() {
        RisePlayerConfiguration.configure({
          displayId: "DISPLAY_ID",
          companyId: "COMPANY_ID",
          playerType: "beta",
          os: "Ubuntu 64",
          playerVersion: "2018.01.01.10.00",
          ip: "213.21.45.40",
          chromeVersion: "68.34",
          debug: true
        }, {});

        RisePlayerConfiguration.Logger.log( COMPONENT_DATA, {
          "level": "debug",
          "event": "object data",
          "event_details": "test dump"
        });

        // Refresh token request + insert request
        expect( requests.length ).to.equal( 2 );
      });

      it( "should log a debug event with the debug method if debug was enabled", function() {
        RisePlayerConfiguration.configure({
          displayId: "DISPLAY_ID",
          companyId: "COMPANY_ID",
          playerType: "beta",
          os: "Ubuntu 64",
          playerVersion: "2018.01.01.10.00",
          ip: "213.21.45.40",
          chromeVersion: "68.34",
          debug: true
        }, {});

        RisePlayerConfiguration.Logger.debug( COMPONENT_DATA, "socket data" );

        // Refresh token request + insert request
        expect( requests.length ).to.equal( 2 );

        var body = JSON.parse( requests[ 1 ].requestBody );
        var entry = body.rows[ 0 ].json;

        expect( entry.level ).to.equal( "debug" );
        expect( entry.event ).to.equal( "socket data" );
        expect( entry.event_details ).to.equal( "" );
        expect( entry.platform ).to.equal( "content" );
        expect( entry.source ).to.equal( COMPONENT_DATA.name );
        expect( entry.version ).to.equal( COMPONENT_DATA.version );
        expect( entry.component.id ).to.equal( COMPONENT_DATA.id );
      });

    });

  });

});
