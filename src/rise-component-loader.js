/* eslint-disable no-console */

RisePlayerConfiguration.ComponentLoader = (() => {

  function connectionHandler( event ) {
    if ( event.detail.isConnected ) {
      window.removeEventListener( "rise-local-messaging-connection", connectionHandler );

      Promise.resolve()
        .then(() => {
          const detail = { detail: { isLoaded: true } };

          // old event, so we don't break existing pages; will be removed soon
          window.dispatchEvent( new CustomEvent( "rise-components-loaded", detail ));

          // components ready event, will be moved elsewhere after when this class disappears
          window.dispatchEvent( new CustomEvent( "rise-components-ready" ));
        });
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
