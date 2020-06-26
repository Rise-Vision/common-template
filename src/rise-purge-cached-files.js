/* eslint-disable no-console, one-var, vars-on-top */

RisePlayerConfiguration.PurgeCacheFiles = (() => {
  const componentCacheKeys = [ "rise-image", "rise-video" ];
  const expiryTime = 1000 * 60 * 6 * 24 * 7;

  function purge() {
    return new Promise(( resolve ) => {
      return _getCacheNames()
        .then( cachesNames => {
          return _getComponentCacheNames( cachesNames );
        })
        .then( componentCacheNames => {
          return Promise.all( componentCacheNames.map( _getCache ));
        })
        .then( componentCaches => {
          return Promise.all( componentCaches.map( _cleanUpCache ));
        })
        .then(() => {
          resolve( "done" );
        });
    })
  }

  function _getCacheNames() {
    return window.caches.keys();
  }

  function _getComponentCacheNames( cacheNames ) {
    return cacheNames.reduce(( acc, value ) => {
      if ( componentCacheKeys.find( key => value.indexOf( key ) > -1 )) {
        acc.push( value );
      }

      return acc;
    }, []);
  }

  function _getCache( name ) {
    return window.caches.open( name );
  }

  function _cleanUpCache( cache ) {
    const currentTimestamp = new Date();

    return cache.matchAll().then( cachedEntries => {
      cachedEntries.forEach( entry => {
        const lastRequested = entry.headers.get( "date" );

        if ( _compareDates( currentTimestamp, lastRequested )) {
          cache.delete( entry.url );
        }
      })
    })
  }

  function _compareDates( currentTimestamp, lastRequested ) {
    const difference = currentTimestamp.valueOf() - new Date( lastRequested ).valueOf();

    if ( difference >= expiryTime ) {
      return true;
    }
    return false;
  }

  const exposedFunctions = {
    purge: purge
  }

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      getCacheNames: _getCacheNames,
      getComponentCacheNames: _getComponentCacheNames,
      getCache: _getCache,
      cleanUpCache: _cleanUpCache,
      compareDates: _compareDates
    });
  }

  return exposedFunctions;
})();
