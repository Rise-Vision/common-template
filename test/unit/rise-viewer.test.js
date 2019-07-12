/* global describe, it, sinon, expect, beforeEach, afterEach */
/* eslint-disable no-console */

"use strict";

describe( "Viewer", function() {

  var riseImage,
    riseText,
    sandbox;

  beforeEach( function() {
    sandbox = sinon.sandbox.create();

    riseImage = { id: "rise-image-1", tagName: "rise-image", dispatchEvent: sandbox.spy() };
    riseText = { id: "rise-text-1", tagName: "rise-text", dispatchEvent: sandbox.spy() };

    sandbox.stub( RisePlayerConfiguration.Helpers, "getRiseElements", function() {
      return Object.values({
        "rise-image": riseImage,
        "rise-text": riseText
      });
    });

    sandbox.stub( window, "addEventListener" );
    sandbox.stub( window, "dispatchEvent" );
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

    expect( riseImage.dispatchEvent ).to.not.have.been.called;
    expect( riseText.dispatchEvent ).to.not.have.been.called;
  });

  it( "should not execute on other events", function() {
    RisePlayerConfiguration.Viewer.receiveData({
      data: { topic: "other" },
      origin: "https://viewer.risevision.com"
    });

    expect( riseImage.dispatchEvent ).to.not.have.been.called;
    expect( riseText.dispatchEvent ).to.not.have.been.called;
    expect( window.dispatchEvent ).to.not.have.been.called;
  });

  it( "should dispatch 'rise-presentation-play' event to components", function() {
    RisePlayerConfiguration.Viewer.receiveData({
      data: { topic: "rise-presentation-play" },
      origin: "https://viewer.risevision.com"
    });

    expect( riseImage.dispatchEvent ).to.have.been.called;
    expect( riseText.dispatchEvent ).to.have.been.called;
    expect( window.dispatchEvent ).to.have.been.called;
  });

  it( "should dispatch 'rise-presentation-stop' event to components", function() {
    RisePlayerConfiguration.Viewer.receiveData({
      data: { topic: "rise-presentation-stop" },
      origin: "https://viewer.risevision.com"
    });

    expect( riseImage.dispatchEvent ).to.have.been.called;
    expect( riseText.dispatchEvent ).to.have.been.called;
    expect( window.dispatchEvent ).to.have.been.called;
  });

});
