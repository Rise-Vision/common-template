/* eslint-disable no-console, one-var */

RisePlayerConfiguration.Watch = (() => {

  const WATCH_DATA_FILE = {
    name: "RisePlayerConfiguration",
    id: "Watch",
    version: "N/A"
  };

  function watchDataFile( filePath, handlerSuccess, handlerError ) {
    RisePlayerConfiguration.LocalStorage.watchSingleFile( filePath, message => {
      return _handleFileUpdateMessage( message, handlerSuccess, handlerError );
    });
  }

  function _handleFileUpdateMessage( message, handlerSuccess, handlerError ) {
    if ( !message.status ) {
      return Promise.resolve();
    }

    switch ( message.status.toUpperCase()) {
    case "CURRENT":
      return _handleFileAvailable( message.fileUrl, handlerSuccess );

    case "FILE-ERROR":
      RisePlayerConfiguration.Logger.error(
        WATCH_DATA_FILE, "data file error", message
      );
      // falls through
    case "NOEXIST":
    case "DELETED":
      if ( handlerError ) {
        return handlerError( message );
      }
    }

    return Promise.resolve();
  }

  function _handleFileAvailable( fileUrl, handlerSuccess ) {

    return RisePlayerConfiguration.Helpers.getLocalMessagingJsonContent( fileUrl )
      .then( data => {
        return handlerSuccess( data );
      })
      .catch( error => {
        RisePlayerConfiguration.Logger.error(
          WATCH_DATA_FILE, "data file read error", error.stack
        );
      });
  }

  const exposedFunctions = {
    watchDataFile: watchDataFile
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      handleFileUpdateMessage: _handleFileUpdateMessage
    });
  }

  return exposedFunctions;

})();
