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

    sinon.stub( RisePlayerConfiguration.Helpers, "getRiseElements", function() {
      return elements;
    });

    sinon.stub( RisePlayerConfiguration.Helpers, "getRiseEditableElements", function() {
      return editableElements;
    });

    sinon.stub( RisePlayerConfiguration.Helpers, "bindOnConfigured", function( element, func ) {
      func();
    });

    sinon.stub( RisePlayerConfiguration.Helpers, "sendStartEvent" );
  });

  afterEach( function() {
    RisePlayerConfiguration.Helpers.getRiseElements.restore();
    RisePlayerConfiguration.Helpers.getRiseEditableElements.restore();
    RisePlayerConfiguration.Helpers.bindOnConfigured.restore();
    RisePlayerConfiguration.Helpers.sendStartEvent.restore();
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
          expect( RisePlayerConfiguration.Helpers.getRiseElements.called ).to.be.true;
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

    it( "should send start event to editable components when never been sent before", function() {
      return RisePlayerConfiguration.AttributeData.sendStartEvent()
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getRiseEditableElements.called ).to.be.true;

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

});
