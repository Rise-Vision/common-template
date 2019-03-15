/* global TEMPLATE_COMMON_CONFIG */
/* eslint-disable no-console, one-var */

RisePlayerConfiguration.Watch = (() => {

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

    RisePlayerConfiguration.LocalStorage.watchSingleFile( filePath, _handleFileUpdateMessage );
  }

  function _handleFileUpdateMessage( message ) {
    if ( !message.status ) {
      return;
    }

    switch ( message.status ) {
    case "FILE-ERROR":
      _handleFileUpdateError( message ); break;

    case "CURRENT":
      _handleFileAvailable( message.fileUrl ); break;

    case "NOEXIST":
    case "DELETED":
      _handleFileDoesntExist(); break;
    }
  }

  function _handleFileUpdateError() {
    // TODO next PR
    console.log( "file update error" );
  }

  function _handleFileAvailable( fileUrl ) {
    const elements = RisePlayerConfiguration.Helpers.getRiseEditableElements();

    console.log( fileUrl );
    console.log( JSON.stringify( elements.map( element => element.tagName )));
  }

  function _handleFileDoesntExist() {
    // TODO next PR
    console.log( "file doesn't exist" );
  }

  const exposedFunctions = {
    watchAttributeDataFile: watchAttributeDataFile
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      handleFileUpdateMessage: _handleFileUpdateMessage
    });
  }

  return exposedFunctions;

})();
