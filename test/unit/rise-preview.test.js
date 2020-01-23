/* global describe, it, sinon, expect, beforeEach, afterEach */
/* eslint-disable no-console */

"use strict";

describe( "Preview", function() {

  var updateStub,
    displayUpdateStub,
    sendStartStub,
    getComponent;

  beforeEach( function() {
    updateStub = sinon.stub( RisePlayerConfiguration.AttributeData, "update" );
    displayUpdateStub = sinon.stub( RisePlayerConfiguration.DisplayData, "update" );
    sendStartStub = sinon.stub( RisePlayerConfiguration.AttributeData, "sendStartEvent" );
    getComponent = sinon.stub( RisePlayerConfiguration.Helpers, "getComponent" );
  });

  afterEach( function() {
    updateStub.restore();
    displayUpdateStub.restore();
    sendStartStub.restore();
    getComponent.restore();
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

  it( "should initialize divHighlight", function() {

    RisePlayerConfiguration.Preview.startListeningForData();

    var div = document.getElementById( "divHighlight" );

    expect( div.style.position ).to.equal( "absolute" );
    expect( div.style.backgroundColor ).to.not.be.null;
    expect( div.style.zIndex ).to.equal( "100" );
  });

  it( "should handle highlightComponent message and update position of divHighlight", function() {
    var el = {};

    el.getBoundingClientRect = function() {
      return { left: 100, top: 200, right: 400, bottom: 600 };
    };

    getComponent.returns( el );

    RisePlayerConfiguration.Preview.startListeningForData();

    RisePlayerConfiguration.Preview.receiveData({
      data: JSON.stringify({ type: "highlightComponent", data: "someId" }),
      origin: "https://widgets.risevision.com"
    });

    // eslint-disable-next-line one-var
    var div = document.getElementById( "divHighlight" );

    expect( div.style.left ).to.equal( "100px" );
    expect( div.style.top ).to.equal( "200px" );
    expect( div.style.width ).to.equal( "300px" );
    expect( div.style.height ).to.equal( "400px" );
  });

});
