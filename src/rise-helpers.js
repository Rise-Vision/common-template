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

  function isInViewer() {
    if ( window.top.RiseVision && window.top.RiseVision.Viewer ) {
      return true;
    }

    return !RisePlayerConfiguration.isPreview() && window.self !== window.top;
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
      const href = window.location.href;
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

  function getRiseEditableElements() {
    return getRiseElements()
      .filter( element => !element.hasAttribute( "non-editable" ))
  }

  function getRisePlayerConfiguration() {
    let configuration = null;

    try {
      configuration = window.getRisePlayerConfiguration || window.top.getRisePlayerConfiguration;
    } catch ( err ) {
      console.log( err );
    }

    return configuration;
  }

  function getWaitForPlayerURLParam() {
    return getHttpParameter( "waitForPlayer" ) === "true";
  }

  function getLocalMessagingTextContent( fileUrl ) {
    return new Promise(( resolve, reject ) => {
      const xhr = new XMLHttpRequest();

      xhr.addEventListener( "load", () => {
        if ( xhr.status === 200 ) {
          resolve( xhr.responseText );
        } else {
          reject( `${ xhr.status } : ${ xhr.statusText } : ${ fileUrl }` );
        }
      });
      xhr.addEventListener( "error", event =>
        reject( `Request failed: ${ JSON.stringify( event )} : ${ fileUrl }` )
      );
      xhr.addEventListener( "abort", event =>
        reject( `Request aborted: ${ JSON.stringify( event )} : ${ fileUrl }` )
      );

      xhr.open( "GET", fileUrl );

      xhr.send();
    });
  }

  function getLocalMessagingJsonContent( fileUrl ) {
    return getLocalMessagingTextContent( fileUrl ).then( content =>
      Promise.resolve().then(() =>
        JSON.parse( content )
      ).catch( error =>
        Promise.reject( `Error: ${ error.stack }\nContent: ${ content }` )
      )
    );
  }

  function sendStartEvent( component ) {
    // Start the component once it's configured;
    // but if it's already configured the listener won't work,
    // so we directly send the request also.
    component.addEventListener( "configured", () =>
      component.dispatchEvent( new CustomEvent( "start" ))
    );
    component.dispatchEvent( new CustomEvent( "start" ));
  }

  function reset() {
    _clients = [];
    _riseElements = null;
  }

  const exposedFunctions = {
    getHttpParameter: getHttpParameter,
    getLocalMessagingJsonContent: getLocalMessagingJsonContent,
    getLocalMessagingTextContent: getLocalMessagingTextContent,
    getRiseElements: getRiseElements,
    getRiseEditableElements: getRiseEditableElements,
    getRisePlayerConfiguration: getRisePlayerConfiguration,
    getWaitForPlayerURLParam: getWaitForPlayerURLParam,
    isTestEnvironment: isTestEnvironment,
    isInViewer: isInViewer,
    onceClientsAreAvailable: onceClientsAreAvailable,
    sendStartEvent: sendStartEvent
  };

  if ( isTestEnvironment()) {
    exposedFunctions.reset = reset
  }

  return exposedFunctions;

})();
