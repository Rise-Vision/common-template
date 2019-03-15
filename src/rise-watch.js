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

    console.log( JSON.stringify( message ));

    switch ( message.status ) {
    case "FILE-ERROR":
      return _handleFileUpdateError( message );

    case "CURRENT":
      return _handleFileAvailable( message.fileUrl );

    case "NOEXIST":
    case "DELETED":
      return _handleFileDoesntExist();
    }
  }

  function _handleFileUpdateError() {
    // TODO next PR
    console.log( "file update error" );
  }

  function _handleFileAvailable( fileUrl ) {
    console.log( `AVAILABLE ${ fileUrl }` );
    const elements = RisePlayerConfiguration.Helpers.getRiseEditableElements();

    console.log( JSON.stringify( elements.map( element => element.tagName )));

    // return fetch( fileUrl )
    //   .then( response => response.json())
    //   .then( console.log )
    //   .catch( console.error );
    const xhr = new XMLHttpRequest();

    xhr.addEventListener( "load", () => console.log( xhr.responseText ));
    xhr.addEventListener( "error", console.error );
    xhr.addEventListener( "abort", console.error );
    xhr.open( "GET", fileUrl );
    xhr.send();
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
