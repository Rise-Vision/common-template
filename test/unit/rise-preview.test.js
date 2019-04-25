/* global describe, it, sinon, expect, beforeEach, afterEach */
/* eslint-disable no-console */

"use strict";

describe( "Preview", function() {

  var updateStub;

  beforeEach( function() {
    updateStub = sinon.stub( RisePlayerConfiguration.AttributeData, "update" );
  });

  afterEach( function() {
    updateStub.restore();
  });

  it( "should receive data from a 'message'", function() {
    RisePlayerConfiguration.Preview.receiveData({ origin: "https://widgets.risevision.com", data: JSON.stringify({ testData: "test" }) });

    expect( updateStub ).to.have.been.calledWith({ testData: "test" });
  });

  it( "should not execute on message if origin not from risevision.com", function() {
    RisePlayerConfiguration.Preview.receiveData({ origin: "https://test.com", data: JSON.stringify({ testData: "test" }) });

    expect( updateStub ).to.not.have.been.called;
  });

});
