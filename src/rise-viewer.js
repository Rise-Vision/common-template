/* eslint-disable no-console, one-var */

RisePlayerConfiguration.Viewer = (() => {

  function isFirstPresentationInSchedule() {
    if ( !RisePlayerConfiguration.Helpers.isInViewer()) {
      throw new Error( "Not in viewer" );
    }

    try {
      const iframeId = window.frameElement.id || "";

      return /^iFrame_sc\d+_pre0$/.test( iframeId );
    } catch ( error ) {
      console.error( "can't retrieve frame id", error );

      // don't assume it's the first if it can't be determined.
      return false;
    }
  }

  function startListeningForData() {
    window.addEventListener( "message", _receiveData, false );
  }

  function send( topic ) {
    let message = {
      topic,
      frameElementId: window.frameElement ? window.frameElement.id : ""
    }

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
    isFirstPresentationInSchedule,
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
