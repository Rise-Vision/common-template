/* eslint-disable no-console, one-var */

RisePlayerConfiguration.AttributeData = (() => {

  const LOGGER_DATA = {
    name: "RisePlayerConfiguration",
    id: "AttributeData",
    version: "N/A"
  };

  let _startEventSent = false;

  function _elementForId( id ) {
    const elements = RisePlayerConfiguration.Helpers.getRiseEditableElements(),
      filtered = elements.filter( element => element.id === id );

    return filtered.length === 0 ? null : filtered[ 0 ];
  }

  function _reset() {
    _startEventSent = false;
  }

  function _setProperty( element, property, value ) {
    const componentId = element.id;

    console.log( `Setting property '${
      property
    }' of component ${
      componentId
    } to value: '${
      JSON.stringify( value )
    }'` );

    try {
      element[ property ] = value;
    } catch ( error ) {
      RisePlayerConfiguration.Logger.error(
        LOGGER_DATA,
        "write component property error",
        {
          componentId: componentId,
          property: property,
          value: value,
          error: error.stack
        }
      );
    }
  }

  function _updateComponentsProperties( data ) {
    const components = data.components || [];

    components.forEach( component => {
      const keys = Object.keys( component ).filter( key => key !== "id" );

      if ( keys.length === 0 ) {
        return;
      }

      const id = component.id;
      const element = _elementForId( id );

      if ( !element ) {
        return RisePlayerConfiguration.Logger.warning(
          LOGGER_DATA,
          "component not found for id in attribute data",
          { componentId: id }
        );
      }

      keys.forEach( key => _setProperty( element, key, component[ key ]));
    });
  }

  function sendStartEvent() {
    if ( !_startEventSent ) {
      RisePlayerConfiguration.Helpers.getRiseEditableElements()
        .forEach( component =>
          RisePlayerConfiguration.Helpers.sendStartEvent( component )
        );

      _startEventSent = true;
    }

    return Promise.resolve();
  }

  function update( data ) {
    _updateComponentsProperties( data );

    return sendStartEvent();
  }

  const exposedFunctions = {
    sendStartEvent: sendStartEvent,
    update: update
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      reset: _reset
    });
  }

  return exposedFunctions;

})();
