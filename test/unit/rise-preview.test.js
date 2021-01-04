/* global describe, it, sinon, expect, beforeEach, afterEach */
/* eslint-disable no-console */

"use strict";

describe( "Preview", function() {

  var _sandbox,
    updateStub,
    displayUpdateStub,
    sendStartStub,
    getComponent;

  beforeEach( function() {
    _sandbox = sinon.sandbox.create();

    updateStub = _sandbox.stub( RisePlayerConfiguration.AttributeData, "update" );
    displayUpdateStub = _sandbox.stub( RisePlayerConfiguration.DisplayData, "update" );
    sendStartStub = _sandbox.stub( RisePlayerConfiguration.AttributeData, "sendStartEvent" );
    getComponent = _sandbox.stub( RisePlayerConfiguration.Helpers, "getComponent" );
    _sandbox.stub( RisePlayerConfiguration, "getPresentationId" ).returns( "presentationId" );
  });

  afterEach( function() {
    _sandbox.restore();
  });

  it( "should receive data from a generic 'message' and use it as attribute data", function() {
    RisePlayerConfiguration.Preview.receiveData({ origin: "https://widgets.risevision.com", data: JSON.stringify({ testData: "test" }) });

    expect( updateStub ).to.have.been.calledWith({ testData: "test" });
  });

  it( "should handle non string data", function() {
    RisePlayerConfiguration.Preview.receiveData({ origin: "https://widgets.risevision.com", data: { testData: "test" } });

    expect( updateStub ).to.have.been.calledWith({ testData: "test" });
  });

  it( "should not execute on message if origin not from risevision.com", function() {
    RisePlayerConfiguration.Preview.receiveData({ origin: "https://test.com", data: JSON.stringify({ testData: "test" }) });

    expect( updateStub ).to.not.have.been.called;
  });

  it( "should check presentation id", function() {
    RisePlayerConfiguration.Preview.receiveData({
      data: JSON.stringify({ id: "presentationId", value: { testData: "test" } }),
      origin: "https://widgets.risevision.com"
    });

    expect( updateStub ).to.have.been.called;
  });

  it( "should not handle messages destined for other presentations", function() {
    RisePlayerConfiguration.Preview.receiveData({
      data: JSON.stringify({ id: "otherId", value: { testData: "test" } }),
      origin: "https://widgets.risevision.com"
    });

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

  it( "should gracefully handle invalid message data", function() {
    RisePlayerConfiguration.Preview.receiveData({ origin: "https://test.com", data: "INVALID:data" });

    expect( updateStub ).to.not.have.been.called;
  });

  it( "should not handle 'rise-components-ready' messages because it's coming from embedded presentation", function() {
    RisePlayerConfiguration.Preview.receiveData({
      data: { topic: "rise-components-ready" },
      origin: "https://widgets.risevision.com"
    });

    //confirm AttributeData.update() is not called
    expect( updateStub ).to.not.have.been.called;
  });

  it( "should not handle 'rise-presentation-play' message (https://github.com/Rise-Vision/rise-vision-apps/issues/2230)", function() {
    RisePlayerConfiguration.Preview.receiveData({
      data: { topic: "rise-presentation-play" },
      origin: "https://widgets.risevision.com"
    });

    //confirm AttributeData.update() is not called
    expect( updateStub ).to.not.have.been.called;
  });

  describe( "_initDataRetrieval:", function() {
    beforeEach( function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "isInViewer" ).returns( false );
      _sandbox.stub( RisePlayerConfiguration.Viewer, "send" );
    });

    it( "should not send get-template-data outside viewer", function() {
      RisePlayerConfiguration.Preview.startListeningForData();

      expect( RisePlayerConfiguration.Viewer.send ).to.not.have.been.called;
    });

    it( "should send get-template-data message in viewer", function() {
      RisePlayerConfiguration.Helpers.isInViewer.returns( true );

      RisePlayerConfiguration.Preview.startListeningForData();

      expect( RisePlayerConfiguration.Viewer.send ).to.have.been.calledWith( "get-template-data", {
        topic: "get-template-data",
        id: "presentationId"
      });
    });
  });

  describe( "components highlight", function() {
    beforeEach( function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "isEditorPreview" ).returns( true );
    });

    it( "should initialize divHighlight if in Editor Preview", function() {
      RisePlayerConfiguration.Preview.startListeningForData();

      var div = document.getElementById( "divHighlight" );

      expect( div.style.display ).to.equal( "none" );
      expect( div.style.position ).to.equal( "absolute" );
      expect( div.style.backgroundColor ).to.not.be.null;
      expect( div.style.zIndex ).to.equal( "1000" );
    });

    it( "should not initialize divHighlight if not Editor Preview", function() {
      RisePlayerConfiguration.Helpers.isEditorPreview.returns( false );

      RisePlayerConfiguration.Preview.startListeningForData();

      var div = document.getElementById( "divHighlight" );

      expect( div.style.display ).to.equal( "none" );
    });

    it( "should handle highlightComponent message and update position of divHighlight", function() {
      document.body.style.width = "1920px";
      document.body.style.height = "1080px";

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

      expect( div.style.display ).to.equal( "block" );
      expect( div.style.left ).to.equal( "100px" );
      expect( div.style.top ).to.equal( "200px" );
      expect( div.style.width ).to.equal( "300px" );
      expect( div.style.height ).to.equal( "400px" );
    });

    it( "should apply document.body dimensions when element dimensions are larger", function() {
      document.body.style.width = "1000px";
      document.body.style.height = "1000px";

      var el = {};

      el.getBoundingClientRect = function() {
        return { left: 0, top: 0, right: 2000, bottom: 2000 };
      };

      getComponent.returns( el );

      RisePlayerConfiguration.Preview.startListeningForData();

      RisePlayerConfiguration.Preview.receiveData({
        data: JSON.stringify({ type: "highlightComponent", data: "someId" }),
        origin: "https://widgets.risevision.com"
      });

      // eslint-disable-next-line one-var
      var div = document.getElementById( "divHighlight" );

      expect( div.style.display ).to.equal( "block" );
      expect( div.style.left ).to.equal( "0px" );
      expect( div.style.top ).to.equal( "0px" );
      // document.body has top and left set as 8px in the test environment
      expect( div.style.width ).to.equal( "1008px" );
      expect( div.style.height ).to.equal( "1008px" );
    });

    it( "should remove highlight when highlight div is clicked", function() {
      RisePlayerConfiguration.Preview.startListeningForData();

      var div = document.getElementById( "divHighlight" );

      div.click();

      expect( div.style.display ).to.equal( "none" );
    });

  });

  describe( "cursor", function() {
    it( "should set cursor:auto if not on a display", function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "isDisplay" ).returns( false );
      _sandbox.stub( RisePlayerConfiguration.Helpers, "isEditorPreview" ).returns( false );

      RisePlayerConfiguration.Preview.startListeningForData();

      expect( window.document.documentElement.style.cursor ).to.equal( "auto" );
    });

    it( "should set cursor:pointer if in Editor Preview", function() {
      _sandbox.stub( RisePlayerConfiguration.Helpers, "isDisplay" ).returns( false );
      _sandbox.stub( RisePlayerConfiguration.Helpers, "isEditorPreview" ).returns( true );

      RisePlayerConfiguration.Preview.startListeningForData();

      expect( window.document.documentElement.style.cursor ).to.equal( "pointer" );
    });
  });

});
