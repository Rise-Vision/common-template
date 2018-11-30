/* eslint-disable no-console, one-var */

RisePlayerConfiguration.Helpers = (() => {

  let _clients = [];

  function _clientsAreAvailable( names ) {
    return names.every( name => _clients.indexOf( name ) >= 0 );
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

  function getDisplayIdFromViewer() {
    let displayId = null;

    try {
      const href = top.location.href;
      const reg = new RegExp( "[?&]id=([^&#]*)", "i" );
      const string = reg.exec( href );

      displayId = string ? string[ 1 ] : null;
    } catch ( err ) {
      console.log( "can't retrieve display id via Viewer", err );
    }

    return displayId;
  }

  function reset() {
    _clients = [];
  }

  const exposedFunctions = {
    isTestEnvironment: isTestEnvironment,
    onceClientsAreAvailable: onceClientsAreAvailable,
    getDisplayIdFromViewer: getDisplayIdFromViewer
  };

  if ( isTestEnvironment()) {
    exposedFunctions.reset = reset
  }

  return exposedFunctions;

})();
