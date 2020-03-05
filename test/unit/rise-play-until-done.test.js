/* global describe, it, sinon, beforeEach, afterEach */
/* eslint-disable no-console, brace-style */

"use strict";

describe( "PlayUntilDone", function() {

  var clock,
    expectedComponents,
    sandbox;

  beforeEach( function() {
    sandbox = sinon.sandbox.create();

    clock = sandbox.useFakeTimers();

    expectedComponents = {
      "rise-image-1": { id: "rise-image-1", tagName: "rise-image", hasAttribute: function() { return true; }, addEventListener: sandbox.stub() },
      "rise-image-2": { id: "rise-image-2", tagName: "rise-image", hasAttribute: function() { return true; }, addEventListener: sandbox.stub() },
      "rise-text-1": { id: "rise-text-1", tagName: "rise-text", hasAttribute: function() { return false; }, addEventListener: sandbox.stub() },
      "rise-play-until-done-1": { id: "rise-play-until-done-1", tagName: "rise-play-until-done", hasAttribute: function() { return false; }, addEventListener: sandbox.stub() },
      "rise-playlist-1": { id: "rise-playlist-1", tagName: "rise-playlist", hasAttribute: function() { return true; }, addEventListener: sandbox.stub() },
      "rise-playlist-item-1": { id: "rise-playlist-item-done-1", tagName: "rise-playlist-item", hasAttribute: function() { return true; }, addEventListener: sandbox.stub() }
    };

    sandbox.stub( RisePlayerConfiguration.Helpers, "getRiseElements", function() {
      return Object.values( expectedComponents );
    });

  });

  afterEach( function() {
    sandbox.restore();
  });

  describe( "start()", function() {
    it( "should set up 'report-done' event listeners on PUD elements", function() {
      RisePlayerConfiguration.PlayUntilDone.start();

      expectedComponents[ "rise-image-1" ].addEventListener.should.have.been.calledWith( "report-done" );
      expectedComponents[ "rise-image-2" ].addEventListener.should.have.been.calledWith( "report-done" );
      expectedComponents[ "rise-play-until-done-1" ].addEventListener.should.have.been.calledWith( "report-done" );
      expectedComponents[ "rise-text-1" ].addEventListener.should.not.have.been.calledWith( "report-done" );
      expectedComponents[ "rise-playlist-1" ].addEventListener.should.have.been.calledWith( "report-done" );
      expectedComponents[ "rise-playlist-item-1" ].addEventListener.should.not.have.been.calledWith( "report-done" );
    });

    it( "should log PUD state every minute", function() {
      sandbox.stub( RisePlayerConfiguration.Logger, "info" );

      RisePlayerConfiguration.PlayUntilDone.start();

      RisePlayerConfiguration.Logger.info.should.have.been.calledOnce;

      clock.tick( 30000 );

      RisePlayerConfiguration.Logger.info.should.have.been.calledOnce;

      clock.tick( 30001 );

      RisePlayerConfiguration.Logger.info.should.have.been.calledTwice;
    });

    it( "should send 'template-done' when all PUD components are done", function() {
      sandbox.stub( RisePlayerConfiguration.PlayUntilDone, "reportTemplateDone" );

      expectedComponents[ "rise-image-1" ].addEventListener.yields({ detail: { done: true } });
      expectedComponents[ "rise-image-2" ].addEventListener.yields({ detail: { done: true } });
      expectedComponents[ "rise-play-until-done-1" ].addEventListener.yields({ detail: { done: true } });
      expectedComponents[ "rise-playlist-1" ].addEventListener.yields({ detail: { done: true } });

      RisePlayerConfiguration.PlayUntilDone.start();

      RisePlayerConfiguration.PlayUntilDone.reportTemplateDone.should.have.been.called;
    });


    it( "should not send 'template-done' when not every PUD components is done", function() {
      sandbox.stub( RisePlayerConfiguration.PlayUntilDone, "reportTemplateDone" );

      expectedComponents[ "rise-image-1" ].addEventListener.yields({ detail: { done: true } });
      expectedComponents[ "rise-image-2" ].addEventListener.yields({ detail: { done: false } });
      expectedComponents[ "rise-play-until-done-1" ].addEventListener.yields({ detail: { done: false } });
      expectedComponents[ "rise-playlist-1" ].addEventListener.yields({ detail: { done: true } });

      RisePlayerConfiguration.PlayUntilDone.start();

      RisePlayerConfiguration.PlayUntilDone.reportTemplateDone.should.not.have.been.called;
    });

  });

  describe( "reportTemplateDone()", function() {
    it( "should send 'template-done' through local messaging when not in viewer", function() {
      sandbox.stub( RisePlayerConfiguration.Helpers, "isInViewer" ).returns( false );
      var onceClientsAreAvailable = sandbox.stub( RisePlayerConfiguration.Helpers, "onceClientsAreAvailable" ).yields();

      sandbox.stub( RisePlayerConfiguration.LocalMessaging, "isConnected" ).returns( true );
      sandbox.stub( RisePlayerConfiguration.LocalMessaging, "broadcastMessage" );

      RisePlayerConfiguration.PlayUntilDone.reportTemplateDone();

      sinon.assert.calledWith( onceClientsAreAvailable, "player-electron" );
      RisePlayerConfiguration.LocalMessaging.broadcastMessage.should.have.been.calledWith({ topic: "template-done" });
    });

    it( "should send 'template-done' through window messaging when in viewer", function() {
      sandbox.stub( RisePlayerConfiguration.Helpers, "isInViewer" ).returns( true );
      sandbox.stub( window.parent, "postMessage" );

      RisePlayerConfiguration.PlayUntilDone.reportTemplateDone();

      window.parent.postMessage.should.have.been.calledWith({ topic: "template-done", frameElementId: "context" }, "*" );
    });

  });

});
