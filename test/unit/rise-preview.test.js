/* global describe, it, sinon, expect */
/* eslint-disable no-console */

"use strict";

describe( "Preview", function() {

  it( "should receive data from a 'message'", function() {
    sinon.stub( console, "log" );

    RisePlayerConfiguration.Preview.receiveData({ origin: "https://widgets.risevision.com", data: JSON.stringify({ testData: "test" }) });

    expect( console.log ).to.have.been.calledWith( "received message with attribute data", { testData: "test" });

    console.log.restore();
  });

  it( "should not execute on message if origin not from risevision.com", function() {
    sinon.stub( console, "log" );

    RisePlayerConfiguration.Preview.receiveData({ origin: "https://test.com", data: JSON.stringify({ testData: "test" }) });

    expect( console.log ).to.not.have.been.called;

    console.log.restore();
  });

});
