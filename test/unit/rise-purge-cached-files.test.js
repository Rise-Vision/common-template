/* eslint-disable one-var, vars-on-top */
/* global describe, it, expect, afterEach, beforeEach, sinon */

"use strict";

describe( "PurgeCacheFiles", function() {
  var sandbox;

  beforeEach( function() {
    sandbox = sinon.sandbox.create();

    sandbox.stub( window, "caches" ).value({
      keys: function() {
        return [ "rise-image/Value 1", "rise-video/Value 2", "custom/Value 2" ];
      }
    });
  })

  afterEach( function() {
    sandbox.restore();
  });

  it( "getCachesNames should return caches keys", function() {
    var response = RisePlayerConfiguration.PurgeCacheFiles.getCacheNames();

    expect( response ).to.deep.equal([ "rise-image/Value 1", "rise-video/Value 2", "custom/Value 2" ]);
  });

  it( "getComponentCaches should return caches keys to delete", function() {
    var response = RisePlayerConfiguration.PurgeCacheFiles.getComponentCaches([ "rise-image/Value 1", "rise-video/Value 2", "custom/Value 2" ]);

    expect( response ).to.deep.equal([ "rise-image/Value 1", "rise-video/Value 2" ]);
  });

  it( "should resolve with 'done' message", function() {
    RisePlayerConfiguration.PurgeCacheFiles.purge().then( function( res ) {
      expect( res ).to.be( "done" );
    });
  });

});
