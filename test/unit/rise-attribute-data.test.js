/* global afterEach, beforeEach, describe, it, expect, sinon */
/* eslint-disable vars-on-top */

"use strict";

describe( "AttributeData", function() {

  var elements,
    editableElements;

  beforeEach( function() {

    editableElements = [
      { id: "rise-data-image-01" },
      { id: "rise-data-financial-01" }
    ],
    elements = [
      { id: "rise-data-image-01" },
      { id: "rise-data-financial-01" },
      { id: "rise-data-financial-non-editable-02" }
    ];

    sinon.stub( RisePlayerConfiguration.Helpers, "getComponent", function( id ) {
      return elements.find( function( element ) {
        return element.id === id;
      });
    });

    sinon.stub( RisePlayerConfiguration.Helpers, "getRiseRootElements", function() {
      return editableElements;
    });

    sinon.stub( RisePlayerConfiguration.Helpers, "getComponentAsync" ).resolves();

    sinon.stub( RisePlayerConfiguration.Helpers, "sendStartEvent" );

    sinon.stub( RisePlayerConfiguration.Viewer, "sendEndpointLog" );
  });

  afterEach( function() {
    RisePlayerConfiguration.Helpers.getComponent.restore();
    RisePlayerConfiguration.Helpers.getRiseRootElements.restore();
    RisePlayerConfiguration.Helpers.getComponentAsync.restore();
    RisePlayerConfiguration.Helpers.sendStartEvent.restore();
    RisePlayerConfiguration.Viewer.sendEndpointLog.restore();
  });

  describe( "update", function() {

    afterEach( function() {
      RisePlayerConfiguration.AttributeData.reset();
    });

    it( "should update attribute data on all elements", function() {

      return RisePlayerConfiguration.AttributeData.update({
        components: [
          {
            id: "rise-data-financial-01",
            symbols: "AAPL.O|AMZN.O|FB.O|GOOGL.O"
          },
          {
            id: "rise-data-financial-non-editable-02",
            symbols: "AAPL.O"
          }
        ]
      })
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getComponent.called ).to.be.true;
          expect( RisePlayerConfiguration.Helpers.sendStartEvent.called ).to.be.true;

          expect( elements ).to.deep.equal([
            {
              id: "rise-data-image-01"
            },
            {
              id: "rise-data-financial-01",
              symbols: "AAPL.O|AMZN.O|FB.O|GOOGL.O"
            },
            {
              id: "rise-data-financial-non-editable-02",
              symbols: "AAPL.O"
            }
          ]);
        });

    });

  });

  describe( "sendStartEvent", function() {

    it( "should send start event to all root components when never been sent before", function() {
      return RisePlayerConfiguration.AttributeData.sendStartEvent()
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getRiseRootElements.called ).to.be.true;

          expect( RisePlayerConfiguration.Helpers.sendStartEvent.calledTwice ).to.be.true;
        });

    });

    it( "should not send start event to components when already been sent", function() {
      return RisePlayerConfiguration.AttributeData.sendStartEvent()
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.sendStartEvent.called ).to.be.false;
        });
    });

  });

  describe( "onAttributeData", function() {

    afterEach( function() {
      RisePlayerConfiguration.AttributeData.reset();
    });

    it( "should wait for attribute data to be available", function() {
      var result = null;

      RisePlayerConfiguration.AttributeData.onAttributeData( function( attributeData ) {
        result = attributeData;
      });

      expect( result ).to.be.null;

      RisePlayerConfiguration.AttributeData.update({ "test": "test" });

      expect( result ).to.deep.equal({ "test": "test" });

    });

    it( "should return attribute data right away if already available", function() {
      var result = null;

      RisePlayerConfiguration.AttributeData.update({ "test": "test" });

      RisePlayerConfiguration.AttributeData.onAttributeData( function( attributeData ) {
        result = attributeData;
      });

      expect( result ).to.deep.equal({ "test": "test" });

    });

    it( "should return attribute data to multiple handlers", function() {
      var result1,
        result2;

      RisePlayerConfiguration.AttributeData.update({ "test": "test" });

      RisePlayerConfiguration.AttributeData.onAttributeData( function( attributeData ) {
        result1 = attributeData;
      });
      RisePlayerConfiguration.AttributeData.onAttributeData( function( attributeData ) {
        result2 = attributeData;
      });

      expect( result1 ).to.deep.equal({ "test": "test" });
      expect( result2 ).to.deep.equal({ "test": "test" });

    });

    it( "should handle display data updates", function() {
      var result;

      RisePlayerConfiguration.AttributeData.update({ "test": "test" });

      RisePlayerConfiguration.AttributeData.onAttributeData( function( attributeData ) {
        result = attributeData;
      });

      expect( result ).to.deep.equal({ "test": "test" });

      RisePlayerConfiguration.AttributeData.update({ "test": "test updated" });

      expect( result ).to.deep.equal({ "test": "test updated" });
    });

  });

});
