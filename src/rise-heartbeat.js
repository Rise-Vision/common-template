/* eslint-disable no-console */

RisePlayerConfiguration.Heartbeat = (() => {

  function connectionHandler( event ) {
    if ( event.detail.isConnected ) {
      window.removeEventListener( "rise-local-messaging-connection", connectionHandler );

      // start heartbeat
    }
  }

  return {
    connectionHandler: connectionHandler
  };

})();

if ( !RisePlayerConfiguration.Helpers.isTestEnvironment()) {
  const handler = RisePlayerConfiguration.Heartbeat.connectionHandler;

  window.addEventListener( "rise-local-messaging-connection", handler );
}
