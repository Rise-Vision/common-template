/* eslint-disable one-var */

RisePlayerConfiguration.Licensing = (() => {

  let _licenses = null;

  function _supportedLicenses() {
    return Object.keys( _licenses );
  }

  function _handleLicensingMessages( message ) {
    if ( !message || !message.topic ) {
      return;
    }

    const match = message.topic.toLowerCase().match( /^(\w+)-licensing-update$/ );

    if ( !match || !message.hasOwnProperty( "isAuthorized" )) {
      return;
    }

    const licenseType = match[ 1 ];
    const license = _licenses[ licenseType ];

    if ( !license || license.authorized === message.isAuthorized ) {
      return;
    }

    license.authorized = message.isAuthorized;

    license.handlers.forEach( handler =>
      _notifyStatus( handler, message.isAuthorized )
    );
  }

  function _notifyStatus( handler, authorized ) {
    handler({ authorized: authorized });
  }

  function start() {
    _supportedLicenses().forEach( license =>
      RisePlayerConfiguration.LocalMessaging.broadcastMessage({
        topic: `${license}-licensing-request`
      })
    );

    RisePlayerConfiguration.LocalMessaging.receiveMessages( _handleLicensingMessages )
  }

  function _onLicenseStatusChange( licenseType, handler ) {
    const license = _licenses[ licenseType ];

    if ( !license ) {
      return;
    }

    license.handlers.push( handler );
    license.authorized !== null && _notifyStatus( handler, license.authorized );
  }

  function onRppLicenseStatusChange( handler ) {
    _onLicenseStatusChange( "rpp", handler );
  }

  function onStorageLicenseStatusChange( handler ) {
    _onLicenseStatusChange( "storage", handler );
  }

  function reset() {
    // authorized flag can be either null, true or false
    _licenses = {
      rpp: {
        authorized: null,
        handlers: []
      },
      storage: {
        authorized: null,
        handlers: []
      }
    };
  }

  const exposedFunctions = {
    start: start,
    onRppLicenseStatusChange: onRppLicenseStatusChange,
    onStorageLicenseStatusChange: onStorageLicenseStatusChange
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      reset: reset
    });
  }

  reset();

  return exposedFunctions;

})();

if ( !RisePlayerConfiguration.Helpers.isTestEnvironment()) {
  const handler = ( event ) => {
    if ( event.detail.isConnected ) {
      window.removeEventListener( "rise-local-messaging-connection", handler );

      RisePlayerConfiguration.Licensing.start();
    }
  };

  window.addEventListener( "rise-local-messaging-connection", handler );
}
