/* eslint-disable one-var, vars-on-top */
/* global describe, it, expect, afterEach, beforeEach, sinon */

"use strict";

describe( "PurgeCacheFiles", function() {
  var sandbox;
  var LOGGER_DATA = {
    name: "RisePlayerConfiguration",
    id: "PurgeCacheFiles",
    version: "N/A"
  };

  beforeEach( function() {
    sandbox = sinon.sandbox.create();

    sandbox.stub( window, "caches" ).value({
      keys: function() {
        return [ "rise-image/Value 1", "rise-video/Value 2", "custom/Value 2" ];
      },
      open: function( name ) {
        return name;
      }
    });
  })

  afterEach( function() {
    sandbox.restore();
  });

  it( "getCacheNames should return caches keys", function() {
    var response = RisePlayerConfiguration.PurgeCacheFiles.getCacheNames();

    expect( response ).to.deep.equal([ "rise-image/Value 1", "rise-video/Value 2", "custom/Value 2" ]);
  });

  describe( "purge", function() {
    it( "should not execute if not running in Preview", function() {
      sandbox.stub( RisePlayerConfiguration, "isPreview" ).returns( false );

      RisePlayerConfiguration.PurgeCacheFiles.purge().then( function() {
        expect( RisePlayerConfiguration.PurgeCacheFiles.getCacheNames.called ).to.be.false;
      });
    });

    it( "should call _getCacheNames", function() {
      RisePlayerConfiguration.PurgeCacheFiles.purge().then( function() {
        expect( RisePlayerConfiguration.PurgeCacheFiles.getCacheNames.called ).to.be.true;
      });
    });

    it( "should call _getComponentCacheNames", function() {
      RisePlayerConfiguration.PurgeCacheFiles.purge().then( function() {
        expect( RisePlayerConfiguration.PurgeCacheFiles.getComponentCacheNames.called ).to.be.true;
      });
    });

    it( "should call _getCache", function() {
      RisePlayerConfiguration.PurgeCacheFiles.purge().then( function() {
        expect( RisePlayerConfiguration.PurgeCacheFiles.getCache.called ).to.be.true;
      });
    });

    it( "should call _cleanUpCache", function() {
      RisePlayerConfiguration.PurgeCacheFiles.purge().then( function() {
        expect( RisePlayerConfiguration.PurgeCacheFiles.cleanUpCache.called ).to.be.true;
      });
    });

    it( "should resolve with 'done' message", function() {
      RisePlayerConfiguration.PurgeCacheFiles.purge().then( function( res ) {
        expect( res ).to.be( "done" );
      });
    });

    describe( "purge error handling", function() {
      beforeEach( function() {
        sandbox = sinon.sandbox.create();
        sandbox.stub( RisePlayerConfiguration.PurgeCacheFiles, "getCacheNames" ).rejects();
      })

      afterEach( function() {
        sandbox.restore();
      })

      it( "should resolve with 'error' message on error", function() {
        RisePlayerConfiguration.PurgeCacheFiles.purge().then( function( res ) {
          expect( res ).to.be( "error" );
        });
      });

      it( "should log to BQ on error", function() {
        sinon.spy( RisePlayerConfiguration.Logger, "warning" );

        RisePlayerConfiguration.PurgeCacheFiles.purge().then( function( err ) {
          expect( RisePlayerConfiguration.Logger.warning ).to.have.been.calledWith({
            componentData: LOGGER_DATA,
            event: "Error trying to purge cache files",
            eventDetails: { error: err }
          });
        });
      })
    });
  });

  it( "getCache should return Caches object", function() {
    var res = RisePlayerConfiguration.PurgeCacheFiles.getCache( "caches object" );

    expect( res ).to.equal( "caches object" );
  });

  describe( "cleanUpCache", function() {
    var cache,
      expValue,
      okValue;

    beforeEach( function() {
      cache = {};
      expValue = {
        url: "test url value",
        headers: {
          get: function() {
            return new Date( "2011/10/11" );
          }
        }
      };

      okValue = {
        url: "test url value",
        headers: {
          get: function() {
            return new Date();
          }
        }
      };

      sinon.stub( cache, "delete" );
      cache.matchAll = sinon.stub().resolves([ okValue, expValue ]);
    });

    it( "should delete all expired values", function() {
      RisePlayerConfiguration.PurgeCacheFiles.cleanUpCache( cache ).then( function() {
        expect( cache.delete.calledWith( expValue.url )).to.be.true;
        expect( cache.delete.calledWith( okValue.url )).to.be.false;
      });
    });
  });

  describe( "hasCacheExpired", function() {
    it( "should return 'true' if the current time is not expired", function() {
      expect( RisePlayerConfiguration.PurgeCacheFiles.hasCacheExpired( new Date(), new Date()))
    });

    it( "should return 'false' if the current time is expired", function() {
      expect( RisePlayerConfiguration.PurgeCacheFiles.hasCacheExpired( new Date(), new Date( "2011/11/10" )))
    });
  });
});
