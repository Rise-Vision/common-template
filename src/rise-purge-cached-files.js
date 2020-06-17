RisePlayerConfiguration.PurgeCacheFiles = (() => {

  function isTestEnvironment() {
    return window.env && window.env.RISE_ENV && window.env.RISE_ENV === "test";
  }

  function RisePurgeCachedFiles() {
    console.log('PURGING FILES');
    return Promise.resolve();
  }

  const exposedFunctions = {
    RisePurgeCachedFiles: RisePurgeCachedFiles
  }

  if ( isTestEnvironment()) {
    exposedFunctions.reset = reset
  }

  return exposedFunctions;

})();
