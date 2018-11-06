/* eslint-disable no-console */

RisePlayerConfiguration.ComponentLoader = (() => {

  function connectionHandler( event ) {
    if ( event.detail.isConnected ) {
      window.removeEventListener( "rise-local-messaging-connection", connectionHandler );

      RisePlayerConfiguration.sendComponentsReadyEvent();
    }
  }

  return {
    connectionHandler: connectionHandler
  };

})();

if ( !RisePlayerConfiguration.Helpers.isTestEnvironment()) {
  const handler = RisePlayerConfiguration.ComponentLoader.connectionHandler;

  window.addEventListener( "rise-local-messaging-connection", handler );
}
