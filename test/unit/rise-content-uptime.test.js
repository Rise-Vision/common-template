/* global describe, it, sinon, expect, beforeEach, afterEach */
/* eslint-disable no-console */

"use strict";

describe( "ContentUptime", function() {

  var clock,
    expectedComponents,
    sandbox;

  beforeEach( function() {
    sandbox = sinon.sandbox.create();

    expectedComponents = {
      "rise-text-1": { id: "rise-text-1", tagName: "rise-text" },
      "rise-data-weather-1": { id: "rise-data-weather-1", tagName: "rise-data-weather" }
    };

    clock = sandbox.useFakeTimers();

    sandbox.stub( window, "addEventListener" );
    sandbox.stub( window, "dispatchEvent" );
    sandbox.stub( window, "clearTimeout" );
    sandbox.stub( RisePlayerConfiguration, "getPresentationId", function() {
      return "presentationId";
    });
    sandbox.stub( RisePlayerConfiguration, "getTemplateProductCode", function() {
      return "pc1";
    });
    sandbox.stub( RisePlayerConfiguration, "getTemplateVersion", function() {
      return "v1";
    });

    sandbox.stub( RisePlayerConfiguration.LocalMessaging, "receiveMessages" );
    sandbox.stub( RisePlayerConfiguration.LocalMessaging, "broadcastMessage" );

    sandbox.stub( RisePlayerConfiguration.Helpers, "getRiseElements", function() {
      return Object.values( expectedComponents );
    });

  });

  afterEach( function() {
    sandbox.restore();
  });

  describe( "start()", function() {
    it( "should listen for messages on start()", function() {
      RisePlayerConfiguration.ContentUptime.start();

      RisePlayerConfiguration.LocalMessaging.receiveMessages.should.have.been.called;
      window.addEventListener.should.have.been.calledWith( "component-uptime-result" );
    });
  });


  describe( "setUptimeError() & hasUptimeError", function() {
    it( "should report no errors by default", function() {
      expect( RisePlayerConfiguration.ContentUptime._hasUptimeError()).to.be.false;
    });

    it( "should honour the error status when reporting uptime", function() {
      RisePlayerConfiguration.ContentUptime.setUptimeError( true );

      expect( RisePlayerConfiguration.ContentUptime._hasUptimeError()).to.be.true;

      RisePlayerConfiguration.ContentUptime.setUptimeError( false );

      expect( RisePlayerConfiguration.ContentUptime._hasUptimeError()).to.be.false;
    });
  });

  describe( "_handleMessage()", function() {

    it( "should request components statuses when uptime is requested", function() {
      RisePlayerConfiguration.ContentUptime._handleMessage({ topic: "content-uptime", forPresentationId: "presentationId" });

      window.dispatchEvent.should.have.been.called;
      expect( window.dispatchEvent.getCall( 0 ).args[ 0 ].type ).to.equal( "component-uptime-request" );

      expect( RisePlayerConfiguration.ContentUptime._getExpectedComponents()).to.deep.equal( expectedComponents );
    });

    it( "should report uptime failure if no response after timeout", function() {
      RisePlayerConfiguration.ContentUptime._handleMessage({ topic: "content-uptime", forPresentationId: "presentationId" });
      clock.tick( 4000 );
      RisePlayerConfiguration.LocalMessaging.broadcastMessage.should.have.been.calledWith(
        { "topic": "content-uptime-result",
          "template": { "presentation_id": "presentationId", "template_product_code": "pc1", "template_version": "v1", "error": false },
          "components": [
            { "component_id": "rise-text-1", "component_type": "rise-text", "responding": false, "presentation_id": "presentationId", "template_product_code": "pc1", "template_version": "v1" },
            { "component_id": "rise-data-weather-1", "component_type": "rise-data-weather", "responding": false, "presentation_id": "presentationId", "template_product_code": "pc1", "template_version": "v1" }
          ]
        }
      );
    });

    it( "should ignore message if not 'content-uptime'", function() {
      RisePlayerConfiguration.ContentUptime._handleMessage({ topic: "incorrect", forPresentationId: "presentationId" });

      window.dispatchEvent.should.not.have.been.called;
    });

    it( "should ignore message not directed to its presentationId", function() {
      RisePlayerConfiguration.ContentUptime._handleMessage({ topic: "content-uptime", forPresentationId: "anotherPresentationId" });
      window.dispatchEvent.should.not.have.been.called;

      RisePlayerConfiguration.ContentUptime._handleMessage({ topic: "content-uptime" });
      window.dispatchEvent.should.not.have.been.called;
    });

    it( "should ignore incorrect message", function() {
      RisePlayerConfiguration.ContentUptime._handleMessage( null );
      window.dispatchEvent.should.not.have.been.called;

      RisePlayerConfiguration.ContentUptime._handleMessage({ event: "content-uptime" });
      window.dispatchEvent.should.not.have.been.called;
    });

  });

  describe( " _handleComponentResult()", function() {
    it( "should store received results", function() {
      //setup expected components
      RisePlayerConfiguration.ContentUptime._handleMessage({ topic: "content-uptime", forPresentationId: "presentationId" });

      RisePlayerConfiguration.ContentUptime._handleComponentResult( new CustomEvent( "component-uptime-result", { detail: { component_id: "rise-text-1" } }));
      expect( Object.keys( RisePlayerConfiguration.ContentUptime._getReceivedResults()).length ).to.equal( 1 );
    });

    it( "should send uptime message when all components reported", function() {
      RisePlayerConfiguration.ContentUptime._handleMessage({ topic: "content-uptime", forPresentationId: "presentationId" });

      RisePlayerConfiguration.ContentUptime._handleComponentResult( new CustomEvent( "component-uptime-result", { detail: { component_id: "rise-text-1", component_type: "rise-text" } }));
      RisePlayerConfiguration.ContentUptime._handleComponentResult( new CustomEvent( "component-uptime-result", { detail: { component_id: "rise-data-weather-1", component_type: "rise-data-weather" } }));

      RisePlayerConfiguration.LocalMessaging.broadcastMessage.should.have.been.calledWith(
        { "topic": "content-uptime-result",
          "template": { "presentation_id": "presentationId", "template_product_code": "pc1", "template_version": "v1", "error": false },
          "components": [
            { "component_id": "rise-text-1", "component_type": "rise-text", "responding": true, "presentation_id": "presentationId", "template_product_code": "pc1", "template_version": "v1" },
            { "component_id": "rise-data-weather-1", "component_type": "rise-data-weather", "responding": true, "presentation_id": "presentationId", "template_product_code": "pc1", "template_version": "v1" }
          ]
        }
      );
      expect( Object.keys( RisePlayerConfiguration.ContentUptime._getReceivedResults()).length ).to.equal( 0 );
    });

    it( "should clear expected components after reporting uptime", function() {
      RisePlayerConfiguration.ContentUptime._handleMessage({ topic: "content-uptime", forPresentationId: "presentationId" });

      RisePlayerConfiguration.ContentUptime._handleComponentResult( new CustomEvent( "component-uptime-result", { detail: { component_id: "rise-text-1", component_type: "rise-text" } }));
      RisePlayerConfiguration.ContentUptime._handleComponentResult( new CustomEvent( "component-uptime-result", { detail: { component_id: "rise-data-weather-1", component_type: "rise-data-weather" } }));

      expect( Object.keys( RisePlayerConfiguration.ContentUptime._getExpectedComponents()).length ).to.equal( 0 );
      expect( Object.keys( RisePlayerConfiguration.ContentUptime._getReceivedResults()).length ).to.equal( 0 );
      window.clearTimeout.should.have.been.called;
    });


    it( "should ignore event if component is not expected", function() {
      RisePlayerConfiguration.ContentUptime._handleMessage({ topic: "content-uptime", forPresentationId: "presentationId" });

      RisePlayerConfiguration.ContentUptime._handleComponentResult( new CustomEvent( "component-uptime-result", { detail: { component_id: "rise-text-222" } }));
      expect( Object.keys( RisePlayerConfiguration.ContentUptime._getReceivedResults()).length ).to.equal( 0 );
    });

    it( "should ignore incorrect event", function() {
      RisePlayerConfiguration.ContentUptime._handleMessage({ topic: "content-uptime", forPresentationId: "presentationId" });

      RisePlayerConfiguration.ContentUptime._handleComponentResult( new CustomEvent( "component-uptime-result" ));
      expect( Object.keys( RisePlayerConfiguration.ContentUptime._getReceivedResults()).length ).to.equal( 0 );

      RisePlayerConfiguration.ContentUptime._handleComponentResult( null );
      expect( Object.keys( RisePlayerConfiguration.ContentUptime._getReceivedResults()).length ).to.equal( 0 );

      RisePlayerConfiguration.ContentUptime._handleComponentResult( new CustomEvent( "component-uptime-result", { detail: {} }));
      expect( Object.keys( RisePlayerConfiguration.ContentUptime._getReceivedResults()).length ).to.equal( 0 );
    });

  });

  describe( "__handleNoResponse()", function() {
    it( "should report when no results from components were received", function() {
      RisePlayerConfiguration.ContentUptime._handleNoResponse();

      RisePlayerConfiguration.LocalMessaging.broadcastMessage.should.have.been.calledWith(
        { "topic": "content-uptime-result",
          "template": { "presentation_id": "presentationId", "template_product_code": "pc1", "template_version": "v1", "error": false },
          "components": [
            { "component_id": "rise-text-1", "component_type": "rise-text", "responding": false, "presentation_id": "presentationId", "template_product_code": "pc1", "template_version": "v1" },
            { "component_id": "rise-data-weather-1", "component_type": "rise-data-weather", "responding": false, "presentation_id": "presentationId", "template_product_code": "pc1", "template_version": "v1" }
          ]
        }
      );
    });

    it( "should properly report if some components reported uptime", function() {
      RisePlayerConfiguration.ContentUptime._handleMessage({ topic: "content-uptime", forPresentationId: "presentationId" });
      RisePlayerConfiguration.ContentUptime._handleComponentResult( new CustomEvent( "component-uptime-result", { detail: { component_id: "rise-text-1", component_type: "rise-text" } }));

      RisePlayerConfiguration.ContentUptime._handleNoResponse();

      RisePlayerConfiguration.LocalMessaging.broadcastMessage.should.have.been.calledWith(
        { "topic": "content-uptime-result",
          "template": { "presentation_id": "presentationId", "template_product_code": "pc1", "template_version": "v1", "error": false },
          "components": [
            { "component_id": "rise-text-1", "component_type": "rise-text", "responding": true, "presentation_id": "presentationId", "template_product_code": "pc1", "template_version": "v1" },
            { "component_id": "rise-data-weather-1", "component_type": "rise-data-weather", "responding": false, "presentation_id": "presentationId", "template_product_code": "pc1", "template_version": "v1" }
          ]
        }
      );
    });

    it( "should clear expected components after reporting uptime", function() {
      RisePlayerConfiguration.ContentUptime._handleMessage({ topic: "content-uptime", forPresentationId: "presentationId" });

      RisePlayerConfiguration.ContentUptime._handleNoResponse();
      expect( Object.keys( RisePlayerConfiguration.ContentUptime._getExpectedComponents()).length ).to.equal( 0 );
      expect( Object.keys( RisePlayerConfiguration.ContentUptime._getReceivedResults()).length ).to.equal( 0 );
    });

  });
});
