
/* eslint-disable no-console, one-var, vars-on-top */

RisePlayerConfiguration.PurgeCacheFiles = (() => {
  const componentCacheKeys = [ "rise-image", "rise-video" ];

  function purge() {
    return new Promise(( resolve ) => {
      return _getCacheNames()
        .then( cachesNames => {
          return _getComponentCaches( cachesNames );
        })
        .then( cachesToDelete => {
          console.log( "cachesToDelete", cachesToDelete );
          resolve( "done" );
        })
    })
  }

  function _getCacheNames() {
    return window.caches.keys();
  }

  function _getComponentCaches( cacheNames ) {
    return cacheNames.reduce(( acc, value ) => {
      if ( componentCacheKeys.find( key => value.indexOf( key ) > -1 )) {
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
