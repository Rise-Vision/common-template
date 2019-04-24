/* global TEMPLATE_COMMON_CONFIG */
/* eslint-disable no-console, one-var */

RisePlayerConfiguration.Watch = (() => {

  const WATCH_COMPONENT_DATA = {
    name: "RisePlayerConfiguration",
    id: "Watch",
    version: "N/A"
  };

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

      return RisePlayerConfiguration.AttributeData.sendStartEvent();
    }

    // No need to get attribute data or sending start if there are no editable elements.
    if ( RisePlayerConfiguration.Helpers.getRiseEditableElements().length === 0 ) {
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

    switch ( message.status.toUpperCase()) {
    case "FILE-ERROR":
      return _handleAttributeDataFileUpdateError( message );

    case "CURRENT":
      return _handleAttributeDataFileAvailable( message.fileUrl );

    case "NOEXIST":
    case "DELETED":
      return RisePlayerConfiguration.AttributeData.sendStartEvent();
    }

    return Promise.resolve();
  }

  function _handleAttributeDataFileUpdateError( message ) {
    RisePlayerConfiguration.Logger.error(
      WATCH_COMPONENT_DATA, "attribute data file error", message
    );

    return RisePlayerConfiguration.AttributeData.sendStartEvent();
  }

  function _handleAttributeDataFileAvailable( fileUrl ) {

    return RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent( fileUrl )
      .then( data => {
        return RisePlayerConfiguration.AttributeData.update( data );
      })
      .catch( error => {
        RisePlayerConfiguration.Logger.error(
          WATCH_COMPONENT_DATA, "attribute data file read error", error.stack
        );
      });
  }

  const exposedFunctions = {
    watchAttributeDataFile: watchAttributeDataFile
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      handleAttributeDataFileUpdateMessage: _handleAttributeDataFileUpdateMessage
    });
  }

  return exposedFunctions;

})();
