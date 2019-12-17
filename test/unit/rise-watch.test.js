"use strict";

describe( "Watch", function() {

  it( "should exist", function() {
    expect( RisePlayerConfiguration.Watch ).to.be.ok;
  });

  describe( "watchDataFile", function() {

    beforeEach( function() {
      sinon.stub( RisePlayerConfiguration.LocalStorage, "watchSingleFile" );
    });

    afterEach( function() {
      RisePlayerConfiguration.LocalStorage.watchSingleFile.restore();
    });

    it( "should send watch for attribute data file", function() {
      RisePlayerConfiguration.Watch.watchDataFile( "risevision-company-notifications/data-file.json" );

      expect( RisePlayerConfiguration.LocalStorage.watchSingleFile ).to.have.been.calledWith(
        "risevision-company-notifications/data-file.json",
        sinon.match.func
      );
    });

  });

  describe( "handleFileUpdateMessage", function() {
    var handlerSuccessStub,
      handlerErrorStub;

    beforeEach( function() {
      handlerSuccessStub = sinon.stub();
      handlerErrorStub = sinon.spy( function() {
        return Promise.resolve();
      });

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

      sinon.stub( RisePlayerConfiguration.Logger, "error" );
    });

    afterEach( function() {
      RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent.restore();
      RisePlayerConfiguration.Logger.error.restore();
    });

    it( "should do nothing if there is no status", function() {
      return RisePlayerConfiguration.Watch.handleFileUpdateMessage({}, handlerSuccessStub, handlerErrorStub )
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent.called ).to.be.false;
          expect( handlerSuccessStub.called ).to.be.false;
          expect( handlerErrorStub.called ).to.be.false;
          expect( RisePlayerConfiguration.Logger.error.called ).to.be.false;
        });
    });

    it( "should execute updating components with attribute data", function() {
      return RisePlayerConfiguration.Watch.handleFileUpdateMessage({
        status: "CURRENT",
        fileUrl: "http://localhost/sample"
      }, handlerSuccessStub, handlerErrorStub )
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent.called ).to.be.true;
          expect( handlerSuccessStub ).to.have.been.calledWith({
            components: [
              {
                id: "rise-data-financial-01",
                symbols: "AAPL.O|AMZN.O|FB.O|GOOGL.O"
              }
            ]
          });
          expect( handlerErrorStub.called ).to.be.false;
          expect( RisePlayerConfiguration.Logger.error.called ).to.be.false;
        });
    });

    it( "should just send start if file does not exist", function() {

      return RisePlayerConfiguration.Watch.handleFileUpdateMessage({
        status: "NOEXIST"
      }, handlerSuccessStub, handlerErrorStub )
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent.called ).to.be.false;
          expect( handlerSuccessStub.called ).to.be.false;
          expect( handlerErrorStub.called ).to.be.true;
          expect( RisePlayerConfiguration.Logger.error.called ).to.be.false;
        });

    });

    it( "should just send start if file was deleted", function() {

      return RisePlayerConfiguration.Watch.handleFileUpdateMessage({
        status: "DELETED"
      }, handlerSuccessStub, handlerErrorStub )
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent.called ).to.be.false;
          expect( handlerSuccessStub.called ).to.be.false;
          expect( handlerErrorStub.called ).to.be.true;
          expect( RisePlayerConfiguration.Logger.error.called ).to.be.false;
        });

    });

    it( "should log error and send start if there was a file error", function() {

      return RisePlayerConfiguration.Watch.handleFileUpdateMessage({
        status: "FILE-ERROR"
      }, handlerSuccessStub, handlerErrorStub )
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent.called ).to.be.false;
          expect( handlerSuccessStub.called ).to.be.false;
          expect( handlerErrorStub.called ).to.be.true;
          expect( RisePlayerConfiguration.Logger.error.called ).to.be.true;
          expect( RisePlayerConfiguration.Logger.error.lastCall.args[ 1 ]).to.equal( "data file RLS error" );
        });
    });

    it( "should log error and call error handler if there was an error when reading the file", function() {

      RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent.restore();

      var parsingError = new Error( "Error when parsing" );

      sinon.stub( RisePlayerConfiguration.Helpers, "getLocalMessagingJsonContent", function() {
        return Promise.reject( parsingError );
      });

      return RisePlayerConfiguration.Watch.handleFileUpdateMessage({
        status: "CURRENT",
        fileUrl: "http://localhost/sample"
      }, handlerSuccessStub, handlerErrorStub )
        .then( function() {
          expect( handlerSuccessStub.called ).to.be.false;
          expect( handlerErrorStub.called ).to.be.true;
          expect( RisePlayerConfiguration.Logger.error.called ).to.be.true;
          expect( RisePlayerConfiguration.Logger.error.lastCall.args[ 1 ]).to.equal( "data file read error" );
        });
    });

    it( "should detect insufficient disk space", function() {

      return RisePlayerConfiguration.Watch.handleFileUpdateMessage({
        status: "FILE-ERROR",
        errorMessage: "Insufficient disk space"
      }, handlerSuccessStub, handlerErrorStub )
        .then( function() {
          expect( RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent.called ).to.be.false;
          expect( handlerSuccessStub.called ).to.be.false;
          expect( handlerErrorStub.called ).to.be.true;
          expect( RisePlayerConfiguration.Logger.error.called ).to.be.true;
          expect( RisePlayerConfiguration.Logger.error.lastCall.args[ 1 ]).to.equal( "file-insufficient-disk-space-error" );
        });
    });

  });

});
