/* eslint-disable no-console, one-var */

RisePlayerConfiguration.AttributeData = (() => {

  const LOGGER_DATA = {
    name: "RisePlayerConfiguration",
    id: "AttributeData",
    version: "N/A"
  };

  let _startEventSent = false,
    _data = null,
    _handlers = [];

  function _elementForId( id ) {
    const elements = RisePlayerConfiguration.Helpers.getRiseElements(),
      filtered = elements.filter( element => element.id === id );

    return filtered.length === 0 ? null : filtered[ 0 ];
  }

  function _reset() {
    _startEventSent = false;
    _data = null;
    _handlers = [];
  }

  function _setPropertyNative( element, property, value ) {
    element[ property ] = value;
  }

  function _setProperty( element, property, value ) {
    const componentId = element.id;
    const logMessage = `Setting property '${ property }' of component ${ componentId } to value: '${ JSON.stringify( value ) }'`;

    console.log( logMessage );

    RisePlayerConfiguration.Viewer.sendEndpointLog({
      severity: "DEBUG",
      eventDetails: logMessage
    });

    try {
      RisePlayerConfiguration.Helpers.bindOnConfigured( element, _setPropertyNative.bind( null, element, property, value ));
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
    _data = data;

    _updateComponentsProperties( _data );

    _handlers.forEach( handler => {
      handler( _data );
    });

    return sendStartEvent();
  }

  function onAttributeData( handler ) {
    _handlers.push( handler );
    _data !== null && handler( _data );
  }

  const exposedFunctions = {
    onAttributeData: onAttributeData,
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
