/* global TEMPLATE_COMMON_CONFIG */
/* eslint-disable no-console, one-var */

RisePlayerConfiguration.Watch = (() => {

  var _startEventSent = false;

  function watchAttributeDataFile() {
    const companyId = RisePlayerConfiguration.getCompanyId();
    const presentationId = RisePlayerConfiguration.getPresentationId();

    if ( !presentationId ) {
      // current templates won't have a presentation id, so they will make this far
      console.log( "No presentation id available; can't send attribute data file watch" );

      return;
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

    console.log( JSON.stringify( message ));

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

  function _handleAttributeDataFileUpdateError() {
    // TODO proper handling next PR
    console.error( "file update error" );

    return _sendStartEvent();
  }

  function _handleAttributeDataFileAvailable( fileUrl ) {
    console.log( `AVAILABLE ${ fileUrl }` );

    return RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent( fileUrl )
      .then( data => {
        console.log( JSON.stringify( data ));

        _updateComponentsProperties( data );

        return _sendStartEvent();
      })
      .catch( error => {
        // TODO proper handling next PR
        console.error( JSON.stringify( error ));
      });
  }

  function _updateComponentsProperties( data ) {
    const components = data.components || [];
    const elements = RisePlayerConfiguration.Helpers.getRiseEditableElements();

    components.forEach( component => {
      const keys = Object.keys( component ).filter( key => key !== "id" );

      if ( keys.length === 0 ) {
        return;
      }

      const element = elements.find( element => element.id === component.id );

      if ( !element ) {
        // TODO: proper handling, next PR
        console.warn( `Can't set properties. No element found with id ${ component.id }` );

        return;
      }

      keys.forEach( key => _setProperty( element, key, component[ key ]));
    });
  }

  function _setProperty( element, key, value ) {
    console.log( `Setting property '${ key }' of component ${ element.id } to value: '${ value }'` );

    try {
      element[ key ] = value;
    } catch ( error ) {
      // TODO: proper handling, next PR
      console.error( error );
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
