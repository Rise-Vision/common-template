/* eslint-disable no-console */

RisePlayerConfiguration.ComponentLoader = (() => {

  function connectionHandler( event ) {
    if (connected) {
      window.removeEventListener( "rise-local-messaging-connection", connectionHandler );

      load();
    }
  }

  function load() {
    console.log( "loading" );
  }

  return {
    connectionHandler: connectionHandler,
    load: load
  }

})();

if ( !RisePlayerConfiguration.isTestEnvironment() ) {
  const handler = RisePlayerConfiguration.ComponentLoader.connectionHandler;

  window.addEventListener( "rise-local-messaging-connection", handler);
}
