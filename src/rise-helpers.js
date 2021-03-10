/* eslint-disable no-console, one-var, vars-on-top */

RisePlayerConfiguration.Helpers = (() => {

  const SHARED_SCHEDULES_UNSUPPORTED_COMPONENTS = [
    "rise-video",
    "rise-data-financial"
  ];
  let _clients = [];
  let _riseElements = null;

  function _clientsAreAvailable( names ) {
    return names.every( name => _clients.indexOf( name ) >= 0 );
  }

  function isTestEnvironment() {
    return window.env && window.env.RISE_ENV && window.env.RISE_ENV === "test";
  }

  function isInViewer() {
    return !!RisePlayerConfiguration.Helpers.getHttpParameter( "frameElementId" ) ||
      ( !RisePlayerConfiguration.isPreview() && window.self !== window.top );
  }

  function isSharedSchedule() {
    return RisePlayerConfiguration.Helpers.getHttpParameter( "type" ) === "sharedschedule";
  }

  function isEditorPreview() {
    return RisePlayerConfiguration.Helpers.getHttpParameter( "type" ) === "preview";
  }

  function isDisplay() {
    return RisePlayerConfiguration.getDisplayId() !== "preview";
  }

  function isStaging() {
    try {
      const pathname = RisePlayerConfiguration.Helpers.getLocationPathname();
      const parts = pathname.split( "/" );

      // example window location:  https://widgets.risevision.com/staging/templates/abc123/src/template.html?type=preview&presentationId=abc123
      // pathname for above would be:  /staging/templates/abc123/src/template.html

      if ( parts[ 1 ] === "staging" ) {
        return true
      }
    } catch ( err ) {
      console.log( "can't retrieve window location pathname", err );

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: "can't retrieve window location pathname"
      });
    }

    return false;
  }

  function getViewerEnv() {
    return RisePlayerConfiguration.Helpers.getHttpParameter( "env" );
  }

  function getViewerId() {
    return RisePlayerConfiguration.Helpers.getHttpParameter( "viewerid" );
  }

  function getViewerType() {
    return RisePlayerConfiguration.Helpers.getHttpParameter( "type" );
  }

  function getLocationPathname() {
    return window.location.pathname;
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

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: "can't retrieve HTTP parameter"
      });

      return null;
    }
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

  function getSharedScheduleUnsupportedElements() {
    return getRiseElements()
      .filter( element => SHARED_SCHEDULES_UNSUPPORTED_COMPONENTS.indexOf( element.tagName.toLowerCase()) >= 0 )
  }

  function getComponent( id ) {
    return getRiseElements()
      .find( element => element.id === id );
  }

  function getComponentAsync( component, sourceString ) {
    if ( component._onConfigured ) {
      return component._onConfigured;
    }

    const promise = new Promise(( resolve ) => {
      const logConfiguredFailure = setTimeout(() => {
        RisePlayerConfiguration.Viewer.sendEndpointLog({
          severity: "IMPORTANT",
          eventDetails: "_onConfigured promise failure (" + ( sourceString || "component" ) + "): " + component.tagName.toLowerCase()
        });
      }, 20 * 60 * 1000 );

      component.addEventListener( "configured", function configured( event ) {
        if ( event.target !== component ) {
          return;
        }

        component.removeEventListener( "configured", configured );

        clearTimeout( logConfiguredFailure );

        resolve();
      });
    });

    return component._onConfigured = promise;
  }

  function _sendEvent( component, topic ) {
    component.dispatchEvent( new CustomEvent( topic ));
  }

  function bindEventAsync( component, topic ) {
    getComponentAsync( component, "event: " + topic )
      .then( _sendEvent.bind( null, component, topic ));
  }

  function sendStartEvent( component ) {
    bindEventAsync( component, "start" );
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
    getLocationPathname: getLocationPathname,
    isTestEnvironment: isTestEnvironment,
    isInViewer: isInViewer,
    isSharedSchedule: isSharedSchedule,
    isEditorPreview: isEditorPreview,
    isDisplay: isDisplay,
    isStaging: isStaging,
    getViewerEnv: getViewerEnv,
    getViewerId: getViewerId,
    getViewerType: getViewerType,
    getSharedScheduleUnsupportedElements: getSharedScheduleUnsupportedElements,
    onceClientsAreAvailable: onceClientsAreAvailable,
    bindEventAsync: bindEventAsync,
    sendStartEvent: sendStartEvent,
    getComponent: getComponent,
    getComponentAsync: getComponentAsync
  };

  if ( isTestEnvironment()) {
    exposedFunctions.reset = reset
  }

  return exposedFunctions;

})();
