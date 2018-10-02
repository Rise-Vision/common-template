/* eslint-disable no-console, one-var */

RisePlayerConfiguration.LocalStorage = (() => {

  function _handleFileUpdate( message, state, handler ) {
    if ( !message || !message.filePath || !message.status || message.filePath !== state.filePath ) {
      return;
    }

    const available = message.status.toUpperCase() === "CURRENT";

    // availability hasn't changed, so don't handle
    if ( available === state.available ) {
      return;
    }

    Object.assign( state, { available, error: false });

    const fileUrl = available ? message.osurl : null;

    handler({ fileUrl, available });
  }

  function _handleFileError( message, state, handler ) {
    if ( !message || !message.filePath ) {
      return;
    }

    // file is not being watched
    if ( message.filePath !== state.filePath ) {
      return;
    }

    const available = false;
    const error = true;

    Object.assign( state, { available, error });

    handler({
      available, error, errorMessage: message.msg, errorDetail: message.detail
    });
  }

  function watchSingleFile( filePath, handler ) {
    RisePlayerConfiguration.LocalMessaging.onceClientsAreAvailable( "local-storage", () => {
      const state = { filePath, error: false };

      RisePlayerConfiguration.LocalMessaging.broadcastMessage({
        topic: "watch", filePath
      });

      RisePlayerConfiguration.LocalMessaging.receiveMessages( message => {
        if ( !message || !message.topic ) {
          return;
        }

        switch ( message.topic.toUpperCase()) {
        case "FILE-UPDATE":
          return _handleFileUpdate( message, state, handler );
        case "FILE-ERROR":
          return _handleFileError( message, state, handler );
        }
      });
    });
  }

  return {
    watchSingleFile: watchSingleFile
  }

})();
