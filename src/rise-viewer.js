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

    window.parent.postMessage( message, "*" );
  }

  function _receiveData( event ) {
    //NOTE: checking for "risevision.com" event.origin will not work in offline mode

    const message = event.data;

    if ( !message || !message.topic ) {
      return;
    }

    const topic = message.topic.toLowerCase();

    if ( topic === "rise-presentation-play" || topic === "rise-presentation-stop" ) {

      RisePlayerConfiguration.Helpers.setRisePresentationPlayReceived( topic === "rise-presentation-play" );

      const riseElements = RisePlayerConfiguration.Helpers.getRiseElements();

      console.log( `Dispatching ${topic} event` );

      riseElements.forEach( element => element.dispatchEvent( new Event( topic )));
      window.dispatchEvent( new Event( topic ));
    } else if ( topic === "get-template-data" ) {
      send( topic, message );
    }
  }

  const exposedFunctions = {
    send,
    startListeningForData
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      receiveData: _receiveData
    });
  }

  return exposedFunctions;

})();
