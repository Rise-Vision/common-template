/* eslint-disable one-var */

const RisePlayerConfiguration = {
  configure: ( playerInfo, localMessagingInfo ) => {
    if ( !playerInfo && !localMessagingInfo ) {
      // outside of viewer or inside of viewer
      const getConfiguration = window.getRisePlayerConfiguration ||
        window.top.getRisePlayerConfiguration;

      if ( typeof getConfiguration === "function" ) {
        const configuration = getConfiguration();

        if ( configuration && configuration.playerInfo && configuration.localMessagingInfo ) {
          playerInfo = configuration.playerInfo;
          localMessagingInfo = configuration.localMessagingInfo;
        } else {
          throw new Error( `The configuration object is not valid: ${ JSON.stringify( configuration ) }` );
        }
      } else {
        throw new Error( "No configuration was provided" );
      }
    }

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
    if ( !RisePlayerConfiguration.Watch ) {
      throw new Error( "RiseWatch script was not loaded" );
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
  isConfigured() {
    return !!RisePlayerConfiguration.getPlayerInfo;
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
  getPresentationId: function() {
    var playerInfo = RisePlayerConfiguration.getPlayerInfo();

    if ( playerInfo && playerInfo.presentationId ) {
      return playerInfo.presentationId;
    }

    return RisePlayerConfiguration.Helpers.getHttpParameter( "presentationId" );
  },
  isPreview: function() {
    return RisePlayerConfiguration.getDisplayId() === "preview";
  },
  sendComponentsReadyEvent() {
    Promise.resolve()
      .then(() => {
        window.dispatchEvent( new CustomEvent( "rise-components-ready" ));

        if ( !RisePlayerConfiguration.isPreview()) {
          RisePlayerConfiguration.Watch.watchAttributeDataFile();
        }
      });
  },
  Helpers: null,
  LocalMessaging: null,
  LocalStorage: null,
  Logger: null
};
