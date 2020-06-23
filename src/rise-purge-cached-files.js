
/* eslint-disable no-console, one-var, vars-on-top */

RisePlayerConfiguration.PurgeCacheFiles = (() => {
  function RisePurgeCachedFiles() {
    return new Promise(( resolve ) => {
      console.log( "PURGING FILES" );
      resolve( "done" );
    })
  }

  const exposedFunctions = {
    RisePurgeCachedFiles: RisePurgeCachedFiles
  }

  return exposedFunctions;
})();
