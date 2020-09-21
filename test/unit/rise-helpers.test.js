/* global assert, describe, document, it, expect, after, afterEach, before, beforeEach, sinon */
/* eslint-disable one-var, vars-on-top */

"use strict";

describe( "Helpers", function() {

  var _sandbox;

  beforeEach( function() {
    _sandbox = sinon.sandbox.create();

    _sandbox.stub( document, "getElementsByTagName", function() {
      return [
        { tagName: "HTML" },
        { tagName: "HEAD" },
        { tagName: "BODY" },
        {
          tagName: "RISE-DATA-IMAGE",
          hasAttribute: function() {
            return true;
          }
        },
        {
          tagName: "RISE-DATA-FINANCIAL",
          hasAttribute: function() {
            return false;
          }
        },
        {
          tagName: "RISE-IMAGE",
          hasAttribute: function() {
            return false;
          }
        },
        { tagName: "P" }
      ];
    });
  });

  afterEach( function() {
    RisePlayerConfiguration.Helpers.reset();

    _sandbox.restore();
  });

  describe( "isInViewer", function() {
    it( "should be in viewer if 'frameElementId' is provided", function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "getHttpParameter" ).returns( true );

      expect( RisePlayerConfiguration.Helpers.isInViewer()).to.be.true;
    });

    it( "should not be in viewer if it's preview", function() {
      _sandbox.stub( RisePlayerConfiguration, "isPreview" ).returns( true );

      expect( RisePlayerConfiguration.Helpers.isInViewer()).to.be.false;
    });
  });

  describe( "isSharedSchedule", function() {
    it( "should return true if 'type=sharedschedule' is provided", function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "getHttpParameter" ).withArgs( "type" ).returns( "sharedschedule" );

      expect( RisePlayerConfiguration.Helpers.isSharedSchedule()).to.be.true;
    });

    it( "should return false for other types", function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "getHttpParameter" ).withArgs( "type" ).returns( "schedule" );

      expect( RisePlayerConfiguration.Helpers.isSharedSchedule()).to.be.false;
    });

    it( "should return false if type is not present", function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "getHttpParameter" ).withArgs( "type" ).returns( undefined );

      expect( RisePlayerConfiguration.Helpers.isSharedSchedule()).to.be.false;
    });
  });

  describe( "isEditorPreview", function() {
    it( "should return true if 'type=preview' is provided", function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "getHttpParameter" ).withArgs( "type" ).returns( "preview" );

      expect( RisePlayerConfiguration.Helpers.isEditorPreview()).to.be.true;
    });

    it( "should return false for other types", function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "getHttpParameter" ).withArgs( "type" ).returns( "schedule" );

      expect( RisePlayerConfiguration.Helpers.isEditorPreview()).to.be.false;
    });

    it( "should return false if type is not present", function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "getHttpParameter" ).withArgs( "type" ).returns( undefined );

      expect( RisePlayerConfiguration.Helpers.isEditorPreview()).to.be.false;
    });
  });

  describe( "isStaging", function() {
    it( "should return true if 'staging' is in window location pathname", function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "getLocationPathname" ).returns( "/staging/templates/abc123/src/template.html" );

      expect( RisePlayerConfiguration.Helpers.isStaging()).to.be.true;
    });

    it( "should return false if 'staging' is not in window location pathname", function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "getLocationPathname" ).returns( "/stable/templates/abc123/src/template.html" );

      expect( RisePlayerConfiguration.Helpers.isStaging()).to.be.false;
    });
  });

  describe( "isDisplay", function() {
    it( "should return true if a valid display id is provided", function() {
      _sandbox.stub( RisePlayerConfiguration, "getDisplayId" ).returns( "DISPLAYID" );

      expect( RisePlayerConfiguration.Helpers.isDisplay()).to.be.true;
    });

    it( "should return false if displayId is 'preview'", function() {
      _sandbox.stub( RisePlayerConfiguration, "getDisplayId" ).returns( "preview" );

      expect( RisePlayerConfiguration.Helpers.isDisplay()).to.be.false;
    });
  });

  describe( "getEnv", function() {
    it( "should return 'env' URL parameter", function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "getHttpParameter" ).withArgs( "env" ).returns( "test_env" );

      expect( RisePlayerConfiguration.Helpers.getEnv()).to.equal( "test_env" );
    });
  });

  describe( "getViewerId", function() {
    it( "should return 'viewerid' URL parameter", function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "getHttpParameter" ).withArgs( "viewerid" ).returns( "test_viewer_id" );

      expect( RisePlayerConfiguration.Helpers.getViewerId()).to.equal( "test_viewer_id" );
    });
  });

  describe( "getRiseElements", function() {

    it( "should get list of rise elements", function() {
      var elements = RisePlayerConfiguration.Helpers.getRiseElements();

      expect( elements ).to.be.ok;
      expect( elements.length ).to.equal( 3 );
      expect( elements[ 0 ].tagName ).to.equal( "RISE-DATA-IMAGE" );
      expect( elements[ 1 ].tagName ).to.equal( "RISE-DATA-FINANCIAL" );
      expect( elements[ 2 ].tagName ).to.equal( "RISE-IMAGE" );
    });
  });

  describe( "getRiseEditableElements", function() {

    it( "should get list of rise editable elements", function() {
      var elements = RisePlayerConfiguration.Helpers.getRiseEditableElements();

      expect( elements ).to.be.ok;
      expect( elements.length ).to.equal( 2 );
      expect( elements[ 0 ].tagName ).to.equal( "RISE-DATA-FINANCIAL" );
      expect( elements[ 1 ].tagName ).to.equal( "RISE-IMAGE" );
    });
  });

  describe( "getSharedScheduleUnsupportedElements", function() {

    it( "should return elements not supported by Shared Schedules", function() {
      var elements = RisePlayerConfiguration.Helpers.getSharedScheduleUnsupportedElements();

      expect( elements ).to.be.ok;
      expect( elements.length ).to.equal( 1 );
      expect( elements[ 0 ].tagName ).to.equal( "RISE-DATA-FINANCIAL" );
    });
  });

  describe( "bindOnConfigured", function() {
    var element;
    var handleEvent;

    beforeEach( function() {
      element = document.createElement( "rise-image" );

      handleEvent = sinon.stub();
    });

    describe( "sendStartEvent", function() {
      it( "should send 'start' event", function() {
        element.setAttribute( "id", "element-1" );

        element.addEventListener( "start", handleEvent );

        RisePlayerConfiguration.Helpers.sendStartEvent( element );

        expect( handleEvent.calledWith()).to.be.true;
      });

      it( "should re-send 'start' event on 'configured', asynchronously", function( done ) {
        element.setAttribute( "id", "element-2" );

        RisePlayerConfiguration.Helpers.sendStartEvent( element );

        element.addEventListener( "start", handleEvent );

        element.dispatchEvent( new CustomEvent( "configured", { bubbles: true, composed: true }));

        expect( handleEvent.calledOnce ).to.be.false;

        setTimeout( function() {
          expect( handleEvent.calledOnce ).to.be.true;

          done();
        }, 10 );
      });

      it( "should remove handler after first 'configured' event", function( done ) {
        element.setAttribute( "id", "element-3" );

        RisePlayerConfiguration.Helpers.sendStartEvent( element );

        element.addEventListener( "start", handleEvent );

        element.dispatchEvent( new CustomEvent( "configured", { bubbles: true, composed: true }));
        element.dispatchEvent( new CustomEvent( "configured", { bubbles: true, composed: true }));

        expect( handleEvent.calledOnce ).to.be.false;

        setTimeout( function() {
          expect( handleEvent.calledOnce ).to.be.true;

          done();
        }, 10 );
      });

    });

    it( "should handle multiple events", function( done ) {
      element.setAttribute( "id", "element-4" );

      RisePlayerConfiguration.Helpers.bindEventOnConfigured( element, "event1" );
      RisePlayerConfiguration.Helpers.bindEventOnConfigured( element, "event2" );

      element.addEventListener( "event1", handleEvent );
      element.addEventListener( "event2", handleEvent );

      element.dispatchEvent( new CustomEvent( "configured", { bubbles: true, composed: true }));

      expect( handleEvent.called ).to.be.false;

      setTimeout( function() {
        expect( handleEvent.calledTwice ).to.be.true;

        done();
      }, 10 );
    });

    it( "should not handle child element 'configured' event", function( done ) {
      var parentElement = document.createElement( "rise-playlist-item" );

      parentElement.setAttribute( "id", "playlist-item-1" );

      parentElement.appendChild( element );
      element.setAttribute( "id", "element-5" );

      RisePlayerConfiguration.Helpers.bindEventOnConfigured( element, "event1" );
      RisePlayerConfiguration.Helpers.bindEventOnConfigured( parentElement, "event2" );

      parentElement.addEventListener( "event2", handleEvent );

      element.dispatchEvent( new CustomEvent( "configured", { bubbles: true, composed: true }));

      expect( handleEvent.called ).to.be.false;

      setTimeout( function() {
        expect( handleEvent.called ).to.be.false;

        parentElement.dispatchEvent( new CustomEvent( "configured", { bubbles: true, composed: true }));

        setTimeout( function() {
          expect( handleEvent.called ).to.be.true;

          done();
        }, 10 );
      }, 10 );
    });

  });

  describe( "getLocalMessagingJsonContent", function() {

    var xhr,
      requests;

    before( function() {
      xhr = sinon.useFakeXMLHttpRequest();

      xhr.onCreate = function( request ) {
        requests.push( request );
      };
    });

    beforeEach( function() {
      requests = [];
    });

    after( function() {
      xhr.restore();
    });

    it( "should get a text response", function() {

      var text = JSON.stringify({ success: true });

      var promise = RisePlayerConfiguration.Helpers.getLocalMessagingTextContent( "" )
        .then( function( content ) {
          expect( content ).to.deep.equal( text );
        });

      requests[ 0 ].respond( 200, { "Content-Type": "text/json" }, text );

      return promise;
    });

    it( "should get a JSON response", function() {

      var expectedAnswer = { success: true };
      var text = JSON.stringify( expectedAnswer );

      var promise = RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent( "" )
        .then( function( content ) {
          expect( content ).to.deep.equal( expectedAnswer );
        });

      requests[ 0 ].respond( 200, { "Content-Type": "text/json" }, text );

      return promise;
    });

    it( "should throw an error if JSON is not well formed", function() {

      var promise = RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent( "" )
        .then( function() {
          assert.fail();
        })
        .catch( function( error ) {
          expect( error ).to.be.ok;
        });

      var text = "INVALID JSON CONTENT";

      requests[ 0 ].respond( 200, { "Content-Type": "text/json" }, text );

      return promise;
    });

  });

});

describe( "Helpers / window connection", function() {

  afterEach( function() {
    delete top.postToPlayer;
    delete top.receiveFromPlayer;

    RisePlayerConfiguration.Helpers.reset();
  });

  describe( "onceClientsAreAvailable", function() {
    it( "should always invoke the action in ChromeOS player", function() {
      var spy = sinon.spy();

      RisePlayerConfiguration.LocalMessaging.configure({
        player: "chromeos", connectionType: "window"
      });

      RisePlayerConfiguration.Helpers.onceClientsAreAvailable( "local-storage", spy );

      expect( spy ).to.have.been.called;
    });
  });

});

describe( "Helpers / websocket connection", function() {

  var socketInstance,
    clock;

  function createSocketInstance() {
    return {
      end: sinon.spy(),
      on: sinon.spy(),
      write: sinon.spy(),
      open: sinon.spy()
    };
  }

  beforeEach( function() {
    socketInstance = createSocketInstance();
    top.PrimusLMS = { connect: function() {} };
    clock = sinon.useFakeTimers();
    sinon.stub( top.PrimusLMS, "connect", function( url ) {
      socketInstance.url = url;
      return socketInstance;
    });
  });

  afterEach( function() {
    top.PrimusLMS.connect.restore();
    delete top.PrimusLMS;
    clock.restore();
  });

  describe( "onceClientsAreAvailable", function() {
    var messagingInternalDataHandler;

    beforeEach( function() {
      var dataHandlerRegistration;

      RisePlayerConfiguration.LocalMessaging.configure({
        player: "electron",
        connectionType: "websocket",
        detail: { serverUrl: "http://localhost:8080" }
      });

      dataHandlerRegistration = socketInstance.on.args.filter( function( call ) {
        return call[ 0 ] === "data";
      })[ 0 ];
      messagingInternalDataHandler = dataHandlerRegistration[ 1 ];
    });

    it( "should request the client list if the requested module is not present in player electron", function() {
      var call = socketInstance.on.args.filter( function( call ) {
          return call[ 0 ] === "open";
        })[ 0 ],
        handler = call[ 1 ];

      handler();

      RisePlayerConfiguration.Helpers.onceClientsAreAvailable( "local-storage", function() {
      });

      expect( socketInstance.write ).to.have.been.calledWith({
        topic: "client-list-request", from: "ws-client"
      });
    });

    it( "should invoke the action when local storage module is present", function( done ) {
      RisePlayerConfiguration.Helpers.onceClientsAreAvailable( "local-storage", done );

      messagingInternalDataHandler({
        topic: "client-list",
        clients: [
          "local-storage", "logging", "watchdog", "licensing", "installer"
        ]
      });
    });

    it( "should invoke the action when local storage and licensing modules are present", function( done ) {
      RisePlayerConfiguration.Helpers.onceClientsAreAvailable([
        "local-storage", "licensing"
      ], done );

      messagingInternalDataHandler({
        topic: "client-list",
        clients: [
          "local-storage", "logging", "watchdog", "installer"
        ]
      });

      messagingInternalDataHandler({
        topic: "client-list",
        clients: [
          "local-storage", "logging", "watchdog", "licensing", "installer"
        ]
      });
    });

  });

});
