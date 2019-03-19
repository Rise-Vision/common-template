/* global afterEach, beforeEach, describe, it, expect, sinon */
/* eslint-disable vars-on-top */

"use strict";

describe( "Watch", function() {

  afterEach( function() {
    RisePlayerConfiguration.Watch.reset();
  });

  it( "should exist", function() {
    expect( RisePlayerConfiguration.Watch ).to.be.ok;
  });

  describe( "watchAttributeDataFile", function() {

    beforeEach( function() {
      sinon.stub( RisePlayerConfiguration.LocalStorage, "watchSingleFile" );

      sinon.stub( RisePlayerConfiguration, "getCompanyId", function() {
        return "COMPANY_ID";
      });
      sinon.stub( RisePlayerConfiguration, "getPresentationId", function() {
        return "PRESENTATION_ID";
      });
    });

    afterEach( function() {
      RisePlayerConfiguration.getCompanyId.restore();
      RisePlayerConfiguration.getPresentationId.restore();
      RisePlayerConfiguration.LocalStorage.watchSingleFile.restore();
    });

    it( "should send watch for attribute data file", function() {

      RisePlayerConfiguration.Watch.watchAttributeDataFile();

      expect( RisePlayerConfiguration.LocalStorage.watchSingleFile ).to.have.been.calledWith(
        "risevision-company-notifications/COMPANY_ID/template-data/PRESENTATION_ID/published/attribute-data.json",
        RisePlayerConfiguration.Watch.handleAttributeDataFileUpdateMessage
      );
    });

    it( "should not send watch if presentation id is not present", function() {

      RisePlayerConfiguration.getPresentationId.restore();
      sinon.stub( RisePlayerConfiguration, "getPresentationId", function() {
        return null;
      });

      RisePlayerConfiguration.Watch.watchAttributeDataFile();

      expect( RisePlayerConfiguration.LocalStorage.watchSingleFile.called ).to.be.false;
    });

  });

  describe( "handleAttributeDataFileUpdateMessage", function() {

    var editableElements;

    beforeEach( function() {

      editableElements = [
        { id: "rise-data-image-01" },
        { id: "rise-data-financial-01" }
      ];

      sinon.stub( RisePlayerConfiguration.Helpers, "getLocalMessagingJsonContent", function() {
        return Promise.resolve({
          components: [
            {
              id: "rise-data-financial-01",
              symbols: "AAPL.O|AMZN.O|FB.O|GOOGL.O"
            }
          ]
        });
      });

      sinon.stub( RisePlayerConfiguration.Helpers, "getRiseEditableElements", function() {
        return editableElements;
      });

      sinon.stub( RisePlayerConfiguration.Helpers, "sendStartEvent" );
    });

    afterEach( function() {
      RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent.restore();
      RisePlayerConfiguration.Helpers.getRiseEditableElements.restore();
      RisePlayerConfiguration.Helpers.sendStartEvent.restore();
    });

    it( "should do nothing if there is no status", function() {

      return RisePlayerConfiguration.Watch.handleAttributeDataFileUpdateMessage({})
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent.called ).to.be.false;
          expect( RisePlayerConfiguration.Helpers.getRiseEditableElements.called ).to.be.false;
          expect( RisePlayerConfiguration.Helpers.sendStartEvent.called ).to.be.false;
        });

    });

    it( "should update attribute data on all editable elements", function() {

      return RisePlayerConfiguration.Watch.handleAttributeDataFileUpdateMessage({
        status: "CURRENT",
        fileUrl: "http://localhost/sample"
      })
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent.called ).to.be.true;
          expect( RisePlayerConfiguration.Helpers.getRiseEditableElements.called ).to.be.true;
          expect( RisePlayerConfiguration.Helpers.sendStartEvent ).to.have.been.called.twice;

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

    it( "should just send start if file does not exist", function() {

      return RisePlayerConfiguration.Watch.handleAttributeDataFileUpdateMessage({
        status: "NOEXIST"
      })
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent.called ).to.be.false;
          expect( RisePlayerConfiguration.Helpers.getRiseEditableElements.called ).to.be.true;
          expect( RisePlayerConfiguration.Helpers.sendStartEvent ).to.have.been.called.twice;
        });

    });

    it( "should just send if file was deleted", function() {

      return RisePlayerConfiguration.Watch.handleAttributeDataFileUpdateMessage({
        status: "DELETED"
      })
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent.called ).to.be.false;
          expect( RisePlayerConfiguration.Helpers.getRiseEditableElements.called ).to.be.true;
          expect( RisePlayerConfiguration.Helpers.sendStartEvent ).to.have.been.called.twice;
        });

    });

    it( "should send start if there was a file error", function() {

      return RisePlayerConfiguration.Watch.handleAttributeDataFileUpdateMessage({
        status: "FILE-ERROR"
      })
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent.called ).to.be.false;
          expect( RisePlayerConfiguration.Helpers.getRiseEditableElements.called ).to.be.true;
          expect( RisePlayerConfiguration.Helpers.sendStartEvent ).to.have.been.called.twice;
        });

    });

  });

});
