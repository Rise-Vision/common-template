/* eslint-disable no-console */

RisePlayerConfiguration.Preview = (() => {

  function _receiveData( event ) {
    if ( event.origin.indexOf( "risevision.com" ) === -1 ) {
      return;
    }

    const data = JSON.parse( event.data );

    switch ( data.type ) {
    case "attributeData":
      RisePlayerConfiguration.AttributeData.update( data.value );
      break;
    case "displayData":
      RisePlayerConfiguration.DisplayData.update( data.value );
      break;
    case "sendStartEvent":
      RisePlayerConfiguration.AttributeData.sendStartEvent();
      break;
    //defaults to attributData for backwards compatibility
    default:
      RisePlayerConfiguration.AttributeData.update( data );
      break;
    }
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
