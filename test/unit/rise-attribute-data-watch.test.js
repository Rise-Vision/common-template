"use strict";

describe( "AttributeDataWatch", function() {

  var elements;

  beforeEach( function() {

    elements = [
      { id: "rise-data-image-01" },
      { id: "rise-data-financial-01" }
    ];

    sinon.stub( RisePlayerConfiguration.Helpers, "getRiseRootElements", function() {
      return elements;
    });
    sinon.stub( RisePlayerConfiguration, "getCompanyId", function() {
      return "COMPANY_ID";
    });
    sinon.stub( RisePlayerConfiguration, "getPresentationId", function() {
      return "PRESENTATION_ID";
    });
    sinon.stub( RisePlayerConfiguration.AttributeData, "sendStartEvent", function() {
      return Promise.resolve();
    });
    sinon.stub( RisePlayerConfiguration.AttributeData, "update", function() {
      return Promise.resolve();
    });
  });

  afterEach( function() {
    RisePlayerConfiguration.Helpers.getRiseRootElements.restore();
    RisePlayerConfiguration.getCompanyId.restore();
    RisePlayerConfiguration.getPresentationId.restore();
    RisePlayerConfiguration.AttributeData.sendStartEvent.restore();
    RisePlayerConfiguration.AttributeData.update.restore();
  });

  it( "should exist", function() {
    expect( RisePlayerConfiguration.AttributeDataWatch ).to.be.ok;
  });

  describe( "watchAttributeDataFile", function() {
    beforeEach( function() {
      sinon.stub( RisePlayerConfiguration.Watch, "watchDataFile" );
    });

    afterEach( function() {
      RisePlayerConfiguration.Watch.watchDataFile.restore();
    });

    it( "should send watch for attribute data file", function() {
      RisePlayerConfiguration.AttributeDataWatch.watchAttributeDataFile();

      expect( RisePlayerConfiguration.Watch.watchDataFile ).to.have.been.calledWith(
        "risevision-company-notifications/COMPANY_ID/template-data/PRESENTATION_ID/published/attribute-data.json",
        RisePlayerConfiguration.AttributeDataWatch.handleAttributeDataFileAvailable,
        RisePlayerConfiguration.AttributeDataWatch.handleAttributeDataFileUpdateError
      );
    });

    it( "should not send watch if presentation id is not present", function() {

      RisePlayerConfiguration.getPresentationId.restore();
      sinon.stub( RisePlayerConfiguration, "getPresentationId", function() {
        return null;
      });

      RisePlayerConfiguration.AttributeDataWatch.watchAttributeDataFile();

      expect( RisePlayerConfiguration.Watch.watchDataFile.called ).to.be.false;
      expect( RisePlayerConfiguration.AttributeData.sendStartEvent.called ).to.be.true;
    });

  });

  describe( "handleAttributeDataFileAvailable", function() {
    afterEach( function() {
      RisePlayerConfiguration.Watch.watchDataFile.restore();
    });

    it( "should just send start on file error", function( done ) {
      sinon.stub( RisePlayerConfiguration.Watch, "watchDataFile", function( url, handlerSuccess, handlerError ) {
        handlerError();
      });

      RisePlayerConfiguration.AttributeDataWatch.watchAttributeDataFile();

      setTimeout( function() {
        expect( RisePlayerConfiguration.AttributeData.update.called ).to.be.false;
        expect( RisePlayerConfiguration.AttributeData.sendStartEvent.called ).to.be.true;

        done();
      }, 10 );
    });

    it( "should execute updating components with attribute data", function( done ) {
      sinon.stub( RisePlayerConfiguration.Watch, "watchDataFile", function( url, handlerSuccess ) {
        handlerSuccess({
          components: [
            {
              id: "rise-data-financial-01",
              symbols: "AAPL.O|AMZN.O|FB.O|GOOGL.O"
            }
          ]
        });
      });

      RisePlayerConfiguration.AttributeDataWatch.watchAttributeDataFile();

      setTimeout( function() {
        expect( RisePlayerConfiguration.AttributeData.sendStartEvent.called ).to.be.false;
        expect( RisePlayerConfiguration.AttributeData.update ).to.have.been.calledWith({
          components: [
            {
              id: "rise-data-financial-01",
              symbols: "AAPL.O|AMZN.O|FB.O|GOOGL.O"
            }
          ]
        });
        done();
      }, 10 );
    });

  });

});
