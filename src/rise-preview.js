/* eslint-disable no-console */

RisePlayerConfiguration.Preview = (() => {

  function _receiveData( event ) {
    if ( event.origin.indexOf( "risevision.com" ) === -1 ) {
      return;
    }

    const data = JSON.parse( event.data );

    RisePlayerConfiguration.AttributeData.update( data );
  }

  function startListeningForData() {
    window.addEventListener( "message", _receiveData );
  }

  const exposedFunctions = {
    startListeningForData: startListeningForData
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      receiveData: _receiveData
    });
  }

  return exposedFunctions;

})();
