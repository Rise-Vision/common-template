/* global afterEach, beforeEach, describe, it, expect, sinon */
/* eslint-disable vars-on-top */

"use strict";

describe( "AttributeData", function() {

  var editableElements;

  beforeEach( function() {

    editableElements = [
      { id: "rise-data-image-01" },
      { id: "rise-data-financial-01" }
    ];

    sinon.stub( RisePlayerConfiguration.Helpers, "getRiseEditableElements", function() {
      return editableElements;
    });

    sinon.stub( RisePlayerConfiguration.Helpers, "sendStartEvent" );
  });

  afterEach( function() {
    RisePlayerConfiguration.Helpers.getRiseEditableElements.restore();
    RisePlayerConfiguration.Helpers.sendStartEvent.restore();
  });

  describe( "update", function() {

    afterEach( function() {
      RisePlayerConfiguration.AttributeData.reset();
    });

    it( "should update attribute data on all editable elements", function() {

      return RisePlayerConfiguration.AttributeData.update({
        components: [
          {
            id: "rise-data-financial-01",
            symbols: "AAPL.O|AMZN.O|FB.O|GOOGL.O"
          }
        ]
      })
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getRiseEditableElements.called ).to.be.true;
          expect( RisePlayerConfiguration.Helpers.sendStartEvent.called ).to.be.true;

          expect( editableElements ).to.deep.equal([
            {
              id: "rise-data-image-01"
            },
            {
              id: "rise-data-financial-01",
              symbols: "AAPL.O|AMZN.O|FB.O|GOOGL.O"
            }
          ]);
        });

    });

  });

  describe( "sendStartEvent", function() {

    it( "should send start event to components when never been sent before", function() {
      return RisePlayerConfiguration.AttributeData.sendStartEvent()
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.sendStartEvent.called ).to.be.true;
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
