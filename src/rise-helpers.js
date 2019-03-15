/* eslint-disable no-console, one-var, vars-on-top */

RisePlayerConfiguration.Helpers = (() => {

  let _clients = [];
  let _riseElements = null;

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

  function getHttpParameter( name ) {
    try {
      const href = top.location.href;
      const regex = new RegExp( `[?&]${ name }=([^&#]*)`, "i" );
      const match = regex.exec( href );

      return match ? match[ 1 ] : null;
    } catch ( err ) {
      console.log( "can't retrieve HTTP parameter", err );

      return null;
    }
  }

  function getRiseElements() {
    if ( _riseElements === null ) {
      _riseElements = [];

      const all = document.getElementsByTagName( "*" );

      for ( var i = 0; i < all.length; i++ ) {
        const element = all[ i ];
        const name = element.tagName.toLowerCase();

        if ( /^rise-/.test( name )) {
          _riseElements.push( element );
        }
      }
    }

    return _riseElements;
  }

  function reset() {
    _clients = [];
    _riseElements = null;
  }

  const exposedFunctions = {
    getHttpParameter: getHttpParameter,
    getRiseElements: getRiseElements,
    isTestEnvironment: isTestEnvironment,
    onceClientsAreAvailable: onceClientsAreAvailable
  };

  if ( isTestEnvironment()) {
    exposedFunctions.reset = reset
  }

  return exposedFunctions;

})();
