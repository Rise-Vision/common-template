/* eslint-disable no-console, one-var */

RisePlayerConfiguration.Viewer = (() => {

  function startListeningForData() {
    window.addEventListener( "message", _receiveData, false );
  }

  function send( topic ) {
    const message = {
      topic,
      frameElementId: window.frameElement ? window.frameElement.id : ""
    }

    console.log( "SENDING TO VIEWER", message );
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
      const riseElements = RisePlayerConfiguration.Helpers.getRiseElements();

      console.log( `Dispatching ${topic} event` );
      RisePlayerConfiguration.Logger.info( RisePlayerConfiguration.RISE_PLAYER_CONFIGURATION_DATA, topic );

      riseElements.forEach( element => element.dispatchEvent( new Event( topic )));
      window.dispatchEvent( new Event( topic ));
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
