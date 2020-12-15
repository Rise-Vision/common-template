/* eslint-disable no-console */

RisePlayerConfiguration.DisplayData = (() => {
  var displayData = null,
    handlers = [];

  function update( message ) {
    console.log( "handle display data message", message );

    RisePlayerConfiguration.Viewer.sendEndpointLog({
      severity: "DEBUG",
      eventDetails: "handle display data message"
    });

    displayData = message;

    handlers.forEach( handler => {
      handler( displayData );
    });
  }

  function _retrieveDisplayData() {
    const displayId = RisePlayerConfiguration.getDisplayId(),
      filePath = `risevision-display-notifications/${displayId}/display.json`;

    RisePlayerConfiguration.Watch.watchDataFile( filePath, update );
  }

  function onDisplayData( handler ) {
    handlers.push( handler );
    displayData !== null && handler( displayData );
  }

  function onDisplayAddress( handler ) {
    onDisplayData(( displayData ) => {
      handler( displayData && displayData.displayAddress );
    });
  }

  function connectionHandler( event ) {
    if ( event.detail.isConnected ) {
      window.removeEventListener( "rise-local-messaging-connection", connectionHandler );

      _retrieveDisplayData();
    }
  }

  const exposedFunctions = {
    connectionHandler,
    onDisplayData,
    onDisplayAddress,
    update
  };

  return exposedFunctions;

})();

if ( !RisePlayerConfiguration.Helpers.isTestEnvironment()) {
  const handler = RisePlayerConfiguration.DisplayData.connectionHandler;

  window.addEventListener( "rise-local-messaging-connection", handler );
}
