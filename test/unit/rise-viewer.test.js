/* global describe, it, sinon, expect, beforeEach, afterEach */
/* eslint-disable no-console */

"use strict";

describe( "Viewer", function() {

  var riseImage,
    riseText,
    sandbox;

  beforeEach( function() {
    sandbox = sinon.sandbox.create();

    riseImage = {};
    riseText = {};

    sandbox.stub( RisePlayerConfiguration.Helpers, "getRiseElements", function() {
      return Object.values({
        "rise-image": riseImage,
        "rise-text": riseText
      });
    });
    sandbox.stub( RisePlayerConfiguration.Helpers, "bindEventOnConfigured" );

    sandbox.stub( window, "addEventListener" );
    sandbox.stub( window, "dispatchEvent" );

    sandbox.spy( window.parent, "postMessage" );
  });

  afterEach( function() {
    sandbox.restore();
  });

  it( "should listen to message events", function() {
    RisePlayerConfiguration.Viewer.startListeningForData();

    expect( window.addEventListener ).to.have.been.calledWith( "message", RisePlayerConfiguration.Viewer.receiveData, false );
  });

  it( "should not execute on message if origin not from risevision.com", function() {
    RisePlayerConfiguration.Viewer.receiveData({ origin: "https://test.com", data: JSON.stringify({ testData: "test" }) });

    expect( RisePlayerConfiguration.Helpers.bindEventOnConfigured ).to.not.have.been.called;
  });

  it( "should not execute on other events", function() {
    RisePlayerConfiguration.Viewer.receiveData({
      data: { topic: "other" },
      origin: "https://viewer.risevision.com"
    });

    expect( RisePlayerConfiguration.Helpers.bindEventOnConfigured ).to.not.have.been.called;
    expect( window.dispatchEvent ).to.not.have.been.called;
  });

  it( "should dispatch 'rise-presentation-play' event to components - online mode", function() {
    RisePlayerConfiguration.Viewer.receiveData({
      data: { topic: "rise-presentation-play" },
      origin: "https://viewer.risevision.com"
    });

    expect( RisePlayerConfiguration.Helpers.bindEventOnConfigured ).to.have.been.calledTwice;
    expect( RisePlayerConfiguration.Helpers.bindEventOnConfigured ).to.have.been.calledWith( riseImage, "rise-presentation-play" );
    expect( RisePlayerConfiguration.Helpers.bindEventOnConfigured ).to.have.been.calledWith( riseText, "rise-presentation-play" );

    expect( window.dispatchEvent ).to.have.been.called;
  });

  it( "should dispatch 'rise-presentation-play' event to components - offline mode", function() {
    RisePlayerConfiguration.Viewer.receiveData({
      data: { topic: "rise-presentation-play" },
      origin: "file://"
    });

    expect( RisePlayerConfiguration.Helpers.bindEventOnConfigured ).to.have.been.calledTwice;
    expect( RisePlayerConfiguration.Helpers.bindEventOnConfigured ).to.have.been.calledWith( riseImage, "rise-presentation-play" );
    expect( RisePlayerConfiguration.Helpers.bindEventOnConfigured ).to.have.been.calledWith( riseText, "rise-presentation-play" );

    expect( window.dispatchEvent ).to.have.been.called;
  });

  it( "should dispatch 'rise-presentation-stop' event to components", function() {
    RisePlayerConfiguration.Viewer.receiveData({
      data: { topic: "rise-presentation-stop" },
      origin: "https://viewer.risevision.com"
    });

    expect( RisePlayerConfiguration.Helpers.bindEventOnConfigured ).to.have.been.calledTwice;
    expect( RisePlayerConfiguration.Helpers.bindEventOnConfigured ).to.have.been.calledWith( riseImage, "rise-presentation-stop" );
    expect( RisePlayerConfiguration.Helpers.bindEventOnConfigured ).to.have.been.calledWith( riseText, "rise-presentation-stop" );

    expect( window.dispatchEvent ).to.have.been.called;
  });

  it( "should forward 'get-template-data' event to viewer", function() {
    RisePlayerConfiguration.Viewer.receiveData({
      data: { topic: "get-template-data" },
      origin: "https://viewer.risevision.com"
    });

    expect( window.dispatchEvent ).to.not.have.been.called;
    expect( window.parent.postMessage ).to.have.been.called;
    expect( window.parent.postMessage ).to.have.been.calledWith({
      topic: "get-template-data",
      frameElementId: "context"
    }, "*" );

  });

  it( "should send messages to Viewer", function() {
    RisePlayerConfiguration.Viewer.send( "topic" );

    expect( window.parent.postMessage ).to.have.been.calledWith({
      topic: "topic",
      frameElementId: "context"
    }, "*" );
  });

  it( "should set provided frameElementId", function() {
    sandbox.stub( RisePlayerConfiguration.Helpers, "getHttpParameter" ).returns( "providedFrameElementId" );

    RisePlayerConfiguration.Viewer.send( "topic" );

    expect( window.parent.postMessage ).to.have.been.calledWith({
      topic: "topic",
      frameElementId: "providedFrameElementId"
    }, "*" );
  });

  it( "should override message properties", function() {
    sandbox.stub( RisePlayerConfiguration.Helpers, "getHttpParameter" ).returns( "providedFrameElementId" );

    RisePlayerConfiguration.Viewer.send( "topic", {
      message: "message",
      topic: "randomTopic",
      frameElementId: "randomFrame"
    });

    expect( window.parent.postMessage ).to.have.been.calledWith({
      message: "message",
      topic: "topic",
      frameElementId: "providedFrameElementId"
    }, "*" );
  });

  it( "should send endpoint logs via existing send method", function() {
    RisePlayerConfiguration.Viewer.sendEndpointLog({
      severity: "INFO",
      eventDetails: "test-event-details",
      eventAppVersion: "test-event-app-version"
    });

    expect( window.parent.postMessage ).to.have.been.calledWith({
      topic: "log-endpoint-event",
      eventApp: "HTML Template",
      eventAppVersion: "test-event-app-version",
      eventDetails: "test-event-details",
      frameElementId: "context",
      severity: "INFO"
    }, "*" );
  });

});
