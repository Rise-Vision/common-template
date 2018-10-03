/* eslint-disable no-console, one-var */

RisePlayerConfiguration.LocalStorage = (() => {

  function _handleFileUpdate( message, state, handler ) {
    if ( !message || !message.filePath || !message.status || message.filePath !== state.filePath ) {
      return;
    }

    const status = message.status.toUpperCase();

    if ( status === state.status ) {
      return;
    }

    Object.assign( state, { status, errorMessage: null, errorDetail: null });

    const fileUrl = status === "CURRENT" ? message.osurl : null;

    handler({ fileUrl, status });
  }

  function _handleFileError( message, state, handler ) {
    if ( !message || !message.filePath ) {
      return;
    }

    // file is not being wathed
    if ( message.filePath !== state.filePath ) {
      return;
    }

    state.status = "FILE-ERROR";

    handler({
      fileUrl: null,
      status: state.status,
      errorMessage: message.msg,
      errorDetail: message.detail
    });
  }

  function watchSingleFile( filePath, handler ) {
    if ( !RisePlayerConfiguration.LocalMessaging.isConnected()) {
      console.log( `Conneciton lost, no sending WATCH for ${ filePath }` );

      return;
    }

    RisePlayerConfiguration.Helpers.onceClientsAreAvailable( "local-storage", () => {
      const state = { filePath, status: "UNKNOWN", available: false };

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
