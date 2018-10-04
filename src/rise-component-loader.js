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

  function _sendComponentsLoadedEvent( isLoaded ) {
    const detail = { detail: { isLoaded: isLoaded } },
      event = new CustomEvent( "rise-components-loaded", detail );

    window.dispatchEvent( event );
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
    console.log( "loading" );

    if ( !_determineRolloutEnvironment()) {
      return _sendComponentsLoadedEvent( false );
    }

    // do not complete the load on test environments.
    if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
      return;
    }

    // TODO: all rollout procedure

    // fixed component names for the time being
    const components = [ "rise-data-image" ];

    fetchComponents( components )
      .then(() => {
        _sendComponentsLoadedEvent( true );
      })
      .catch( error => {
        console.log( error );

        _sendComponentsLoadedEvent( false );
      });
  }

  function fetchComponents( components, download = fetch ) { // eslint-disable-line no-unused-vars
    return Promise.resolve();
  }

  // for testing purposes
  function clear() {
    _rolloutEnvironment = null;
  }

  const exposedFunctions = {
    connectionHandler: connectionHandler,
    getRolloutEnvironment: getRolloutEnvironment
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    exposedFunctions.clear = clear;
    exposedFunctions.fetchComponents = fetchComponents;
    exposedFunctions.load = load;
  }

  return exposedFunctions;

})();

if ( !RisePlayerConfiguration.Helpers.isTestEnvironment()) {
  const handler = RisePlayerConfiguration.ComponentLoader.connectionHandler;

  window.addEventListener( "rise-local-messaging-connection", handler );
}
