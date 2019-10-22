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

  function _receiveData( event ) {
    //NOTE: checking for "risevision.com" event.origin will not work in offline mode

    const message = event.data;

    if ( !message || !message.topic ) {
      return;
    }

    const topic = message.topic.toLowerCase();

    if ( topic === "rise-presentation-play" || topic === "rise-presentation-stop" ) {
      const riseElements = RisePlayerConfiguration.Helpers.getRiseElements();

      setTimeout(() => {
        console.log( `Dispatching ${topic} event` );
        RisePlayerConfiguration.Logger.info( RisePlayerConfiguration.RISE_PLAYER_CONFIGURATION_DATA, topic );

        riseElements.forEach( element => element.dispatchEvent( new Event( topic )));
        window.dispatchEvent( new Event( topic ));
      }, 100 );
    }
  }

  const exposedFunctions = {
    isFirstPresentationInSchedule,
    startListeningForData
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      receiveData: _receiveData
    });
  }

  return exposedFunctions;

})();
