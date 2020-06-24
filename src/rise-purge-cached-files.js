
/* eslint-disable no-console, one-var, vars-on-top */

RisePlayerConfiguration.PurgeCacheFiles = (() => {
  function purge() {
    return new Promise(( resolve ) => {
      console.log( "PURGING FILES" );
      resolve( "done" );
    })
  }

  const exposedFunctions = {
    purge: purge
  }

  return exposedFunctions;
})();
