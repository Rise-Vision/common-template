/* global TEMPLATE_COMMON_CONFIG */
/* eslint-disable no-console, one-var */

RisePlayerConfiguration.Watch = (() => {

  const WATCH_COMPONENT_DATA = {
    name: "RisePlayerConfiguration",
    id: "Watch",
    version: "N/A"
  };

  var _startEventSent = false;

  function watchAttributeDataFile() {
    const companyId = RisePlayerConfiguration.getCompanyId();
    const presentationId = RisePlayerConfiguration.getPresentationId();

    if ( !presentationId ) {
      // current templates won't have a presentation id, so they will make this far
      RisePlayerConfiguration.Logger.error(
        WATCH_COMPONENT_DATA,
        "no presentation id",
        "Can't send attribute data file watch"
      );

      return _sendStartEvent();
    }

    const filePath = `${
      TEMPLATE_COMMON_CONFIG.GCS_COMPANY_BUCKET
    }/${
      companyId
    }/template-data/${
      presentationId
    }/published/${
      TEMPLATE_COMMON_CONFIG.GCS_ATTRIBUTE_DATA_FILE
    }`;

    RisePlayerConfiguration.LocalStorage.watchSingleFile( filePath, _handleAttributeDataFileUpdateMessage );
  }

  function _handleAttributeDataFileUpdateMessage( message ) {
    if ( !message.status ) {
      return Promise.resolve();
    }

    switch ( message.status.toUpperCase()) {
    case "FILE-ERROR":
      return _handleAttributeDataFileUpdateError( message );

    case "CURRENT":
      return _handleAttributeDataFileAvailable( message.fileUrl );

    case "NOEXIST":
    case "DELETED":
      return _sendStartEvent();
    }

    return Promise.resolve();
  }

  function _handleAttributeDataFileUpdateError( message ) {
    RisePlayerConfiguration.Logger.error(
      WATCH_COMPONENT_DATA, "attribute data file error", message
    );

    return _sendStartEvent();
  }

  function _handleAttributeDataFileAvailable( fileUrl ) {

    return RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent( fileUrl )
      .then( data => {
        _updateComponentsProperties( data );

        return _sendStartEvent();
      })
      .catch( error => {
        RisePlayerConfiguration.Logger.error(
          WATCH_COMPONENT_DATA, "attribute data file read error", error.stack
        );
      });
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
          WATCH_COMPONENT_DATA,
          "component not found for id in attribute data",
          { componentId: id }
        );
      }

      keys.forEach( key => _setProperty( element, key, component[ key ]));
    });
  }

  function _elementForId( id ) {
    const elements = RisePlayerConfiguration.Helpers.getRiseEditableElements();
    const filtered = elements.filter( element => element.id === id );

    return filtered.length === 0 ? null : filtered[ 0 ];
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
        WATCH_COMPONENT_DATA,
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

  function _sendStartEvent() {
    if ( !_startEventSent ) {
      RisePlayerConfiguration.Helpers.getRiseEditableElements()
        .forEach( component =>
          RisePlayerConfiguration.Helpers.sendStartEvent( component )
        );

      _startEventSent = true;
    }

    return Promise.resolve();
  }

  function _reset() {
    _startEventSent = false;
  }

  const exposedFunctions = {
    watchAttributeDataFile: watchAttributeDataFile
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      handleAttributeDataFileUpdateMessage: _handleAttributeDataFileUpdateMessage,
      reset: _reset
    });
  }

  return exposedFunctions;

})();
