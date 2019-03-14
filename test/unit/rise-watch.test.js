/* global afterEach, beforeEach, describe, it, expect, sinon */
/* eslint-disable vars-on-top */

"use strict";

describe( "Watch", function() {

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

  it( "should exist", function() {
    expect( RisePlayerConfiguration.Watch ).to.be.ok;
  });

  it( "should send watch for attribute data file", function() {

    RisePlayerConfiguration.Watch.watchAttributeDataFile();

    expect( RisePlayerConfiguration.LocalStorage.watchSingleFile ).to.have.been.calledWith(
      "risevision-company-notifications/COMPANY_ID/template-data/PRESENTATION_ID/published/attribute-data.json",
      RisePlayerConfiguration.Watch.handleFileUpdateMessage
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
