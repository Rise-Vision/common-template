RisePlayerConfiguration.Logger = (() => {

  function configure() {

  }

  function reset() {
  }

  const exposedFunctions = {
    configure: configure
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    exposedFunctions.reset = reset;
  }

  return exposedFunctions;

})();
