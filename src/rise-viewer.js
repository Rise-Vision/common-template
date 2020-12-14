/* eslint-disable no-console, one-var */

RisePlayerConfiguration.Viewer = (() => {

  function startListeningForData() {
    window.addEventListener( "message", _receiveData, false );
  }

  function send( topic, message ) {
    const frameElementId = RisePlayerConfiguration.Helpers.getHttpParameter( "frameElementId" ) ?
      RisePlayerConfiguration.Helpers.getHttpParameter( "frameElementId" ) :
      window.frameElement ? window.frameElement.id : "";

    message = message || {};
    message.topic = topic;
    message.frameElementId = frameElementId;

    if ( window.parent === window ) {
      return;
    }

    window.parent.postMessage( message, "*" );
  }

  function sendEndpointLog( fields = {}) {
    if ( !fields.severity || !fields.eventDetails ) {
      send( "log-endpoint-event", {
        severity: "ERROR",
        eventApp: `HTML Template: ${RisePlayerConfiguration.getTemplateName()}`,
        eventAppVersion: RisePlayerConfiguration.getTemplateVersion(),
        eventErrorCode: "E000000010",
        eventDetails: `invalid log call attempt - missing fields - ${JSON.stringify( fields )}`,
        debugInfo: new Error().stack
      });
    }

    send( "log-endpoint-event", Object.assign({}, {
      eventApp: "HTML Template",
      eventAppVersion: RisePlayerConfiguration.getTemplateVersion()
    }, fields ));
  }

  function _receiveData( event ) {
    //NOTE: checking for "risevision.com" event.origin will not work in offline mode

    const message = event.data;

    if ( !message || !message.topic ) {
      return;
    }

    const topic = message.topic.toLowerCase();

    if ( topic === "rise-presentation-play" || topic === "rise-presentation-stop" ) {

      const riseElements = RisePlayerConfiguration.Helpers.getRiseElements();

      console.log( `Dispatching ${topic} event` );

      riseElements.forEach( element => RisePlayerConfiguration.Helpers.bindEventOnConfigured( element, topic ));
      window.dispatchEvent( new Event( topic ));
    } else if ( topic === "get-template-data" ) {
      send( topic, message );
    }
  }

  const exposedFunctions = {
    send,
    sendEndpointLog,
    startListeningForData
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      receiveData: _receiveData
    });
  }

  return exposedFunctions;

})();
