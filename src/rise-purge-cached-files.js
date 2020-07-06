/* eslint-disable no-console, one-var, vars-on-top */

RisePlayerConfiguration.PurgeCacheFiles = (() => {
  const BASE_COMPONENT_CACHE_KEYS = [ "rise-image", "rise-video" ];
  const EXPIRY_TIME = 1000 * 60 * 1;
  const LOGGER_DATA = {
    name: "RisePlayerConfiguration",
    id: "PurgeCacheFiles",
    version: "N/A"
  };

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
        })
        .catch( err => {
          RisePlayerConfiguration.Logger.warning(
            LOGGER_DATA,
            "Error trying to purge cache files",
            { error: err }
          );
          resolve( "error" );
        })
    })
  }

  function _getCacheNames() {
    return window.caches.keys();
  }

  function _getComponentCacheNames( cacheNames ) {
    return cacheNames.reduce(( acc, value ) => {
      if ( BASE_COMPONENT_CACHE_KEYS.find( key => value.indexOf( key ) > -1 )) {
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

        if ( _hasCacheExpired( currentTimestamp, lastRequested )) {
          cache.delete( entry.url );
        }
      })
    })
  }

  function _hasCacheExpired( currentTimestamp, lastRequested ) {
    const difference = currentTimestamp.getTime() - new Date( lastRequested ).getTime();

    if ( difference >= EXPIRY_TIME ) {
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
      hasCacheExpired: _hasCacheExpired
    });
  }

  return exposedFunctions;
})();
