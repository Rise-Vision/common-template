/* eslint-disable no-console */

RisePlayerConfiguration.ComponentLoader = (() => {

  let _rolloutEnvironment = null;

  function _determineRolloutEnvironment() {
    const playerInfo = RisePlayerConfiguration.getPlayerInfo();

    if ( playerInfo.developmentManifestUrl ) {
      _rolloutEnvironment = "development";
    } else {
      if ( !playerInfo.playerType ) {
        console.log( "No playerType parameter provided." );

        return false;
      }
      if ( playerInfo.playerType !== "beta" && playerInfo.playerType !== "stable" ) {
        console.log( `Illegal playerType parameter provided: '${ playerInfo.playerType }'` );

        return false;
      }

      _rolloutEnvironment = playerInfo.playerType;
    }

    return true;
  }

  function connectionHandler( event ) {
    if ( event.detail.isConnected ) {
      window.removeEventListener( "rise-local-messaging-connection", connectionHandler );

      load();
    }
  }

  function getRolloutEnvironment() {
    return _rolloutEnvironment;
  }

  function load() {
    if ( !_determineRolloutEnvironment()) {
      return;
    }

    console.log( "loading" );
    // TODO: load the page
  }

  // for testing purposes
  function clear() {
    _rolloutEnvironment = null;
  }

  const exposedFunctions = {
    connectionHandler: connectionHandler,
    getRolloutEnvironment: getRolloutEnvironment
  }

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    exposedFunctions.clear = clear;
    exposedFunctions.load = load;
  }

  return exposedFunctions;

})();

if ( !RisePlayerConfiguration.Helpers.isTestEnvironment()) {
  const handler = RisePlayerConfiguration.ComponentLoader.connectionHandler;

  window.addEventListener( "rise-local-messaging-connection", handler );
}
