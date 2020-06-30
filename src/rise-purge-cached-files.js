
/* eslint-disable no-console, one-var, vars-on-top */

RisePlayerConfiguration.PurgeCacheFiles = (() => {
  const BASE_COMPONENT_CACHE_KEYS = [ "rise-image", "rise-video" ];

  function purge() {
    return new Promise(( resolve ) => {
      return _getCacheNames()
        .then( cachesNames => {
          return _getComponentCaches( cachesNames );
        })
        .then( componentCacheKeys => {
          console.log( "componentCacheKeys", componentCacheKeys );
          resolve( "done" );
        })
    })
  }

  function _getCacheNames() {
    return window.caches.keys();
  }

  function _getComponentCaches( cacheNames ) {
    return cacheNames.reduce(( acc, value ) => {
      if ( BASE_COMPONENT_CACHE_KEYS.find( key => value.indexOf( key ) > -1 )) {
        acc.push( value );
      }

      return acc;
    }, []);
  }

  const exposedFunctions = {
    purge: purge
  }

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      getCacheNames: _getCacheNames,
      getComponentCaches: _getComponentCaches
    });
  }

  return exposedFunctions;
})();
