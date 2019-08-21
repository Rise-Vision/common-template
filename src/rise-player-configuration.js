/* eslint-disable no-console, one-var */

const RisePlayerConfiguration = {
  RISE_PLAYER_CONFIGURATION_DATA: {
    name: "RisePlayerConfiguration",
    id: "RisePlayerConfiguration",
    version: "N/A"
  },
  configure: ( playerInfo, localMessagingInfo ) => {
    if ( !playerInfo && !localMessagingInfo ) {
      // outside of viewer or inside of viewer
      const getConfiguration = RisePlayerConfiguration.Helpers.getRisePlayerConfiguration();

      if ( typeof getConfiguration === "function" ) {
        const configuration = getConfiguration();

        if ( configuration && configuration.playerInfo && configuration.localMessagingInfo ) {
          playerInfo = configuration.playerInfo;
          localMessagingInfo = configuration.localMessagingInfo;
        } else {
          throw new Error( `The configuration object is not valid: ${ JSON.stringify( configuration ) }` );
        }
      }
    } else {
      console.log( "player configuration not present, running in Preview mode" );
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
    if ( !RisePlayerConfiguration.Preview ) {
      throw new Error( "RisePreview script was not loaded" );
    }
    if ( !RisePlayerConfiguration.Viewer ) {
      throw new Error( "RiseViewer script was not loaded" );
    }
    if ( !RisePlayerConfiguration.PlayUntilDone ) {
      throw new Error( "PlayUntilDone script was not loaded" );
    }
    if ( !RisePlayerConfiguration.DisplayData ) {
      throw new Error( "DisplayData script was not loaded" );
    }
    if ( !RisePlayerConfiguration.Branding ) {
      throw new Error( "Branding script was not loaded" );
    }
    if ( !RisePlayerConfiguration.ContentUptime ) {
      throw new Error( "ContentUptime script was not loaded" );
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

    if ( RisePlayerConfiguration.Helpers.isInViewer()) {
      RisePlayerConfiguration.Viewer.startListeningForData();
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

    return playerInfo ? playerInfo.displayId || "preview" : "preview";
  },
  getPresentationId: function() {
    var playerInfo = RisePlayerConfiguration.getPlayerInfo();

    if ( playerInfo && playerInfo.presentationId ) {
      return playerInfo.presentationId;
    }

    return RisePlayerConfiguration.Helpers.getHttpParameter( "presentationId" );
  },
  getTemplateProductCode() {
    return window.TEMPLATE_PRODUCT_CODE ? window.TEMPLATE_PRODUCT_CODE : "";
  },
  getTemplateVersion() {
    return window.TEMPLATE_VERSION ? window.TEMPLATE_VERSION : "";
  },
  getTemplateName() {
    return window.TEMPLATE_NAME ? window.TEMPLATE_NAME : "";
  },
  isPreview: function() {
    return RisePlayerConfiguration.getDisplayId() === "preview";
  },
  dispatchWindowEvent( name ) {
    window.dispatchEvent( new CustomEvent( name ));
  },
  sendComponentsReadyEvent() {
    return Promise.resolve()
      .then(() => {
        RisePlayerConfiguration.dispatchWindowEvent( "rise-components-ready" );

        if ( !RisePlayerConfiguration.isPreview()) {
          RisePlayerConfiguration.Logger.info(
            RisePlayerConfiguration.RISE_PLAYER_CONFIGURATION_DATA,
            "rise-components-ready"
          );

          RisePlayerConfiguration.AttributeDataWatch.watchAttributeDataFile();
        } else {
          RisePlayerConfiguration.dispatchWindowEvent( "rise-presentation-play" );
          RisePlayerConfiguration.Preview.startListeningForData();
        }
      });
  },
  Helpers: null,
  LocalMessaging: null,
  LocalStorage: null,
  Logger: null
};
