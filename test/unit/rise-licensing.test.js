/* eslint-disable one-var, vars-on-top */
/* global describe, it, expect, afterEach, beforeEach, sinon */

"use strict";

describe( "Licensing", function() {

  beforeEach( function() {
    sinon.spy( RisePlayerConfiguration.LocalMessaging, "broadcastMessage" );
  });

  afterEach( function() {
    RisePlayerConfiguration.LocalMessaging.broadcastMessage.restore();
    RisePlayerConfiguration.LocalMessaging.receiveMessages.restore();

    RisePlayerConfiguration.Licensing.reset();
  });

  it( "should request licensing at startup", function() {
    sinon.spy( RisePlayerConfiguration.LocalMessaging, "receiveMessages" );

    RisePlayerConfiguration.Licensing.start();

    var broadcast = RisePlayerConfiguration.LocalMessaging.broadcastMessage;
    var receiveMessages = RisePlayerConfiguration.LocalMessaging.receiveMessages;

    expect( broadcast.calledTwice ).to.be.true;
    expect( receiveMessages.calledOnce ).to.be.true;

    var firstTopic = broadcast.getCall( 0 ).args[ 0 ].topic;
    var isLicensingRequest = firstTopic == "rpp-licensing-request" ||
      firstTopic == "storage-licensing-request";

    expect( isLicensingRequest ).to.be.true;

    var secondTopic = broadcast.getCall( 1 ).args[ 0 ].topic;

    isLicensingRequest = secondTopic == "rpp-licensing-request" ||
      secondTopic == "storage-licensing-request";
    expect( isLicensingRequest ).to.be.true;
  });

  describe( "RPP", function() {

    it( "should report RPP authorization if it's received after startup", function( done ) {
      sinon.stub( RisePlayerConfiguration.LocalMessaging, "receiveMessages", function( handler ) {
        handler({ topic: "rpp-licensing-update", isAuthorized: true });
      });

      var handler = function( message ) {
        expect( message ).to.deep.equal({ authorized: true });

        done();
      }

      RisePlayerConfiguration.Licensing.start();
      RisePlayerConfiguration.Licensing.onRppLicenseStatusChange( handler );
    });

    it( "should report RPP authorization if it's received before startup", function( done ) {
      sinon.stub( RisePlayerConfiguration.LocalMessaging, "receiveMessages", function( handler ) {
        handler({ topic: "rpp-licensing-update", isAuthorized: false });
      });

      var handler = function( message ) {
        expect( message ).to.deep.equal({ authorized: false });

        done();
      }

      RisePlayerConfiguration.Licensing.onRppLicenseStatusChange( handler );
      RisePlayerConfiguration.Licensing.start();
    });

    it( "should report RPP authorization if takes some time to receive it", function( done ) {
      sinon.stub( RisePlayerConfiguration.LocalMessaging, "receiveMessages", function( handler ) {
        setTimeout( function() {
          handler({ topic: "rpp-licensing-update", isAuthorized: true });
        }, 1000 );
      });

      var handler = function( message ) {
        expect( message ).to.deep.equal({ authorized: true });

        done();
      }

      RisePlayerConfiguration.Licensing.start();
      RisePlayerConfiguration.Licensing.onRppLicenseStatusChange( handler );
    });

  });

  describe( "Storage", function() {

    it( "should report storage authorization if it's received after startup", function( done ) {
      sinon.stub( RisePlayerConfiguration.LocalMessaging, "receiveMessages", function( handler ) {
        handler({ topic: "storage-licensing-update", isAuthorized: true });
      });

      var handler = function( message ) {
        expect( message ).to.deep.equal({ authorized: true });

        done();
      }

      RisePlayerConfiguration.Licensing.start();
      RisePlayerConfiguration.Licensing.onStorageLicenseStatusChange( handler );
    });

    it( "should report storage authorization if it's received before startup", function( done ) {
      sinon.stub( RisePlayerConfiguration.LocalMessaging, "receiveMessages", function( handler ) {
        handler({ topic: "storage-licensing-update", isAuthorized: false });
      });

      var handler = function( message ) {
        expect( message ).to.deep.equal({ authorized: false });

        done();
      }

      RisePlayerConfiguration.Licensing.onStorageLicenseStatusChange( handler );
      RisePlayerConfiguration.Licensing.start();
    });

    it( "should report storage authorization if takes some time to receive it", function( done ) {
      sinon.stub( RisePlayerConfiguration.LocalMessaging, "receiveMessages", function( handler ) {
        setTimeout( function() {
          handler({ topic: "storage-licensing-update", isAuthorized: true });
        }, 1000 );
      });

      var handler = function( message ) {
        expect( message ).to.deep.equal({ authorized: true });

        done();
      }

      RisePlayerConfiguration.Licensing.start();
      RisePlayerConfiguration.Licensing.onStorageLicenseStatusChange( handler );
    });

  });

});
