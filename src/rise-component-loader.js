/* eslint-disable no-console */

RisePlayerConfiguration.ComponentLoader = (() => {

  let _rolloutEnvironment;

  _determineRolloutEnvironment() {
    const playerInfo = RisePlayerConfiguration.getPlayerInfo();

    if ( playerInfo.developmentManifestUrl ) {
      _rolloutEnvironment = "development";
    }
    else {
      _rolloutEnvironment = playerInfo.playerType;

      if( !_rolloutEnvironment ) {
        console.log( `No playerType parameter provided.` );

        return false;
      }
      if( _rolloutEnvironment !== "beta" && _rolloutEnvironment !== "stable" ) {
        console.log( `Illegal playerType parameter provided: '${ _rolloutEnvironment }'` );

        return false;
      }
    }

    return true;
  }

  function connectionHandler( event ) {
    if (connected) {
      window.removeEventListener( "rise-local-messaging-connection", connectionHandler );

      load();
    }
  }

  function getRolloutEnvironment() {
    return _rolloutEnvironment;
  }

  function load() {
    if ( !_determineRolloutEnvironment() ) {
      return;
    }

    // TODO: load the page
  }

  return {
    connectionHandler: connectionHandler,
    getRolloutEnvironment: getRolloutEnvironment,
    load: load
  }

})();

if ( !RisePlayerConfiguration.Helpers.isTestEnvironment() ) {
  const handler = RisePlayerConfiguration.ComponentLoader.connectionHandler;

  window.addEventListener( "rise-local-messaging-connection", handler);
}
