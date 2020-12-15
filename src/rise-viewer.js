/* eslint-disable no-console, one-var */

RisePlayerConfiguration.Viewer = (() => {

  const heartbeatInterval = {};

  heartbeatInterval.promise = new Promise( res => {
    heartbeatInterval.resolver = res;
  });

  function startListeningForData() {
    window.addEventListener( "message", _receiveData, false );
    send( "get-heartbeat-interval" );
    startEndpointApplicationHeartbeats();
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
      eventApp: `HTML Template: ${RisePlayerConfiguration.getTemplateName()}`,
      eventAppVersion: RisePlayerConfiguration.getTemplateVersion()
    }, fields ));
  }

  function sendEndpointHeartbeat( fields = {}) {
    send( "log-endpoint-heartbeat", Object.assign({}, {
      componentId: null,
      eventApp: `HTML Template: ${RisePlayerConfiguration.getTemplateName()}`,
      eventAppVersion: RisePlayerConfiguration.getTemplateVersion()
    }, fields ));
  }

  function startEndpointApplicationHeartbeats( fields = {}, intervalSetter = setInterval ) {
    return heartbeatInterval.promise.then( intervalMS => {
      sendEndpointHeartbeat( fields );
      intervalSetter(() => sendEndpointHeartbeat( fields ), intervalMS );
    });
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

      RisePlayerConfiguration.Viewer.sendEndpointLog({
        severity: "DEBUG",
        eventDetails: `Dispatching ${topic} event`
      });


      riseElements.forEach( element => RisePlayerConfiguration.Helpers.bindEventOnConfigured( element, topic ));
      window.dispatchEvent( new Event( topic ));
    } else if ( topic === "get-template-data" ) {
      send( topic, message );
    } else if ( topic === "heartbeat-interval" ) {
      heartbeatInterval.resolver( message.intervalMS );
    }
  }

  const exposedFunctions = {
    send,
    sendEndpointLog,
    sendEndpointHeartbeat,
    startListeningForData,
    startEndpointApplicationHeartbeats
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      receiveData: _receiveData
    });
  }

  return exposedFunctions;

})();
