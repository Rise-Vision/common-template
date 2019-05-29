/* global describe, it, sinon, expect, beforeEach, afterEach */
/* eslint-disable no-console */

"use strict";

describe( "Preview", function() {

  var updateStub,
    displayUpdateStub,
    sendStartStub;

  beforeEach( function() {
    updateStub = sinon.stub( RisePlayerConfiguration.AttributeData, "update" );
    displayUpdateStub = sinon.stub( RisePlayerConfiguration.DisplayData, "update" );
    sendStartStub = sinon.stub( RisePlayerConfiguration.AttributeData, "sendStartEvent" );
  });

  afterEach( function() {
    updateStub.restore();
    displayUpdateStub.restore();
    sendStartStub.restore();
  });

  it( "should receive data from a generic 'message' and use it as attribute data", function() {
    RisePlayerConfiguration.Preview.receiveData({ origin: "https://widgets.risevision.com", data: JSON.stringify({ testData: "test" }) });

    expect( updateStub ).to.have.been.calledWith({ testData: "test" });
  });

  it( "should not execute on message if origin not from risevision.com", function() {
    RisePlayerConfiguration.Preview.receiveData({ origin: "https://test.com", data: JSON.stringify({ testData: "test" }) });

    expect( updateStub ).to.not.have.been.called;
  });

  it( "should handle attributeData message and pass its value", function() {
    RisePlayerConfiguration.Preview.receiveData({
      data: JSON.stringify({ type: "attributeData", value: { testData: "test" } }),
      origin: "https://widgets.risevision.com"
    });

    expect( updateStub ).to.have.been.calledWith({ testData: "test" });
  });

  it( "should handle displayData message and pass its value", function() {
    RisePlayerConfiguration.Preview.receiveData({
      data: JSON.stringify({ type: "displayData", value: { testData: "test" } }),
      origin: "https://widgets.risevision.com"
    });

    expect( displayUpdateStub ).to.have.been.calledWith({ testData: "test" });
  });

  it( "should handle sendStartEvent message", function() {
    RisePlayerConfiguration.Preview.receiveData({
      data: JSON.stringify({ type: "sendStartEvent" }),
      origin: "https://widgets.risevision.com"
    });

    expect( sendStartStub ).to.have.been.called;
  });

});
