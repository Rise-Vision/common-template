/* eslint-disable one-var */
RisePlayerConfiguration.Viewer = (() => {

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

      riseElements.forEach( element => element.dispatchEvent( new Event( topic )));
      window.dispatchEvent( new Event( topic ));
    }
  }

  const exposedFunctions = {
    startListeningForData
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      receiveData: _receiveData
    });
  }

  return exposedFunctions;

})();
