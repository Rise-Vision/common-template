/* eslint-disable no-console, one-var */

RisePlayerConfiguration.Helpers = (() => {

  let _clients = [];

  function _clientsAreAvailable( names ) {
    return names.every( name => _clients.indexOf( name ) >= 0 );
  }

  function _getDisplaysEndpointURL() {
    const playerType = RisePlayerConfiguration.LocalMessaging.getPlayerType();

    return playerType === "electron" ? "https://localhost:9495/displays" : "http://127.0.0.1:9494/displays";
  }

  function isTestEnvironment() {
    return window.env && window.env.RISE_ENV && window.env.RISE_ENV === "test";
  }

  function onceClientsAreAvailable( requiredClientNames, action ) {
    let invoked = false;
    const names = typeof requiredClientNames === "string" ?
      [ requiredClientNames ] : requiredClientNames;
    const playerType = RisePlayerConfiguration.LocalMessaging.getPlayerType();

    if ( playerType !== "electron" || _clientsAreAvailable( names )) {
      return action();
    }

    RisePlayerConfiguration.LocalMessaging.receiveMessages( message => {
      if ( invoked || message.topic.toUpperCase() !== "CLIENT-LIST" ) {
        return;
      }

      _clients = message.clients;

      if ( _clientsAreAvailable( names )) {
        invoked = true;
        action();
      }
    });

    RisePlayerConfiguration.LocalMessaging.broadcastMessage({
      topic: "client-list-request"
    });
  }

  function getDisplayIdByEndpoint( callback ) {
    const xmlhttp = new XMLHttpRequest();
    const serverUrl = _getDisplaysEndpointURL();

    xmlhttp.onreadystatechange = () => {
      try {
        if ( xmlhttp.readyState === 4 && xmlhttp.status === 200 ) {
          try {
            const responseObject = JSON.parse( xmlhttp.responseText );

            callback( responseObject.displayId );
          } catch ( err ) {
            console.log( "displays endpoint: parse error", err );
            callback( null );
          }
        } else {
          console.log( "displays endpoint: request failed", xmlhttp.status );
          callback( null );
        }
      } catch ( err ) {
        console.debug( "Caught exception: ", err.message );
        callback( null );
      }
    };

    xmlhttp.open( "GET", serverUrl );
    xmlhttp.send();
  }

  function reset() {
    _clients = [];
  }

  const exposedFunctions = {
    isTestEnvironment: isTestEnvironment,
    onceClientsAreAvailable: onceClientsAreAvailable,
    getDisplayIdByEndpoint: getDisplayIdByEndpoint
  };

  if ( isTestEnvironment()) {
    exposedFunctions.reset = reset
  }

  return exposedFunctions;

})();
