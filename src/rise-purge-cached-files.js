
/* eslint-disable no-console, one-var, vars-on-top */

RisePlayerConfiguration.PurgeCacheFiles = (() => {
  const cacheKeys = [ "rise-image", "rise-video" ];

  function purge() {
    return new Promise(( resolve ) => {
      return _getCachesNames()
        .then( cachesNames => {
          return _getCachesToDelete( cachesNames );
        })
        .then( cachesToDelete => {
          console.log( "cachesToDelete", cachesToDelete );
          resolve( "done" );
        })
    })
  }

  function _getCachesNames() {
    return window.caches.keys();
  }

  function _getCachesToDelete( cachesNames ) {
    return cachesNames.filter( name => {
      if ( name.match( cacheKeys [ 0 ]) || name.match( cacheKeys [ 0 ])) {
        return name;
      }
    })
  }

  const exposedFunctions = {
    purge: purge
  }

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      getCachesNames: _getCachesNames,
      getCachesToDelete: _getCachesToDelete
    });
  }

  return exposedFunctions;
})();
