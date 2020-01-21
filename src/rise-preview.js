/* eslint-disable no-console */

RisePlayerConfiguration.Preview = (() => {

  function _receiveData( event ) {
    if ( event.origin.indexOf( "risevision.com" ) === -1 ) {
      return;
    }

    const data = _parseEventData( event );

    if ( !data ) {
      return;
    }

    switch ( data.type ) {
    case "attributeData":
      RisePlayerConfiguration.AttributeData.update( data.value );
      break;
    case "displayData":
      RisePlayerConfiguration.DisplayData.update( data.value );
      break;
    case "sendStartEvent":
      RisePlayerConfiguration.AttributeData.sendStartEvent();
      RisePlayerConfiguration.PlayUntilDone.start();
      break;
    //defaults to attributData for backwards compatibility
    default:
      RisePlayerConfiguration.AttributeData.update( data );
      break;
    }
  }

  function _parseEventData( event ) {
    try {
      return JSON.parse( event.data );
    // eslint-disable-next-line no-empty
    } catch ( error ) { }
    return null;
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
