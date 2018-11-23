/* eslint-disable one-var */

const RisePlayerConfiguration = {
  configure: ( playerInfo, localMessagingInfo ) => {

    RisePlayerConfiguration.getPlayerInfo = () => playerInfo;

    if ( !RisePlayerConfiguration.LocalMessaging ) {
      throw new Error( "RiseLocalMessaging script was not loaded" );
    }
    if ( !RisePlayerConfiguration.LocalStorage ) {
      throw new Error( "RiseLocalStorage script was not loaded" );
    }
    if ( !RisePlayerConfiguration.Logger ) {
      throw new Error( "RiseLogger script was not loaded" );
    }
    if ( !RisePlayerConfiguration.Helpers ) {
      throw new Error( "RiseHelpers script was not loaded" );
    }
    if ( !RisePlayerConfiguration.Licensing ) {
      throw new Error( "RiseLicensing script was not loaded" );
    }
    if ( !RisePlayerConfiguration.Heartbeat ) {
      throw new Error( "RiseHeartbeat script was not loaded" );
    }

    RisePlayerConfiguration.Logger.configure();

    if ( RisePlayerConfiguration.isPreview()) {
      RisePlayerConfiguration.sendComponentsReadyEvent();
    } else {
      if ( !RisePlayerConfiguration.Helpers.isTestEnvironment()) {
        const handler = ( event ) => {
          if ( event.detail.isConnected ) {
            window.removeEventListener( "rise-local-messaging-connection", handler );

            RisePlayerConfiguration.sendComponentsReadyEvent();
          }
        };

        window.addEventListener( "rise-local-messaging-connection", handler );
      }

      RisePlayerConfiguration.LocalMessaging.configure( localMessagingInfo );
    }

    // lock down RisePlayerConfiguration object
    if ( !RisePlayerConfiguration.Helpers.isTestEnvironment()) {
      Object.freeze( RisePlayerConfiguration );
    }
  },
  getChromeVersion: function() {
    const info = RisePlayerConfiguration.getPlayerInfo();

    if ( info && info.chromeVersion ) {
      return info.chromeVersion;
    }

    const match = navigator.userAgent.match( /Chrom(e|ium)\/([0-9.]+)/ );

    return match ? match[ 2 ] : null;
  },
  getCompanyId: function() {
    var playerInfo = RisePlayerConfiguration.getPlayerInfo();

    return playerInfo ? playerInfo.companyId : null;
  },
  getDisplayId: function() {
    var playerInfo = RisePlayerConfiguration.getPlayerInfo();

    return playerInfo ? playerInfo.displayId : null;
  },
  isPreview: function() {
    return RisePlayerConfiguration.getDisplayId() === "preview";
  },
  sendComponentsReadyEvent() {
    Promise.resolve()
      .then(() => {
        window.dispatchEvent( new CustomEvent( "rise-components-ready" ));
      });
  },
  Helpers: null,
  LocalMessaging: null,
  LocalStorage: null,
  Logger: null
};
