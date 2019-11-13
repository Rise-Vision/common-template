/* eslint-disable no-console, one-var */

const RisePlayerConfiguration = (() => {

  function _getPlayerConfiguration() {
    // outside of viewer or inside of viewer
    const getConfiguration = RisePlayerConfiguration.Helpers.getRisePlayerConfiguration();

    if ( typeof getConfiguration !== "function" ) {
      return null;
    }

    return getConfiguration();
  }

  function _getPlayerInfo() {
    if ( RisePlayerConfiguration.isConfigured()) {
      return RisePlayerConfiguration.getPlayerInfo();
    }

    const configuration = _getPlayerConfiguration();

    return configuration && configuration.playerInfo;
  }

  function _init( playerInfo, localMessagingInfo ) {
    if ( !playerInfo && !localMessagingInfo ) {
      const configuration = _getPlayerConfiguration();

      if ( configuration ) {
        if ( configuration.playerInfo && configuration.localMessagingInfo ) {
          playerInfo = configuration.playerInfo;
          localMessagingInfo = configuration.localMessagingInfo;
        } else {
          throw new Error( `The configuration object is not valid: ${ JSON.stringify( configuration ) }` );
        }
      } else {
        console.log( "no injected configuration found, configuring as preview" );
      }
    } else {
      console.log( "explicit configuration provided, this is likely a test environment" );
    }

    RisePlayerConfiguration.getPlayerInfo = () => playerInfo;

    return localMessagingInfo;
  }

  function _validateAllRequiredObjectsAreAvailable() {
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
  }

  function _configureLocalMessaging( localMessagingInfo ) {
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

  function _sendRisePresentationPlayOnDocumentLoad() {
    const sendRisePresentationPlay = () => {
      if ( !RisePlayerConfiguration.Helpers.isTestEnvironment()) {
        RisePlayerConfiguration.Logger.info( RisePlayerConfiguration.RISE_PLAYER_CONFIGURATION_DATA, "rise-presentation-play" );
      }
      RisePlayerConfiguration.dispatchWindowEvent( "rise-presentation-play" );
    };

    window.addEventListener( "DOMContentLoaded", sendRisePresentationPlay );

    if ( document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive" ) {
      sendRisePresentationPlay();
    }
  }

  function _lockDownRisePlayerConfiguration() {
    Object.freeze( RisePlayerConfiguration );
  }

  function configure( playerInfo, localMessagingInfo ) {
    _validateAllRequiredObjectsAreAvailable();

    const configuration = _getPlayerConfiguration();
    const isInViewer = RisePlayerConfiguration.Helpers.isInViewer();

    if ( !configuration && RisePlayerConfiguration.Helpers.getWaitForPlayerURLParam()) {
      setTimeout(() => configure( playerInfo, localMessagingInfo ), 100 );
      return;
    }

    localMessagingInfo = _init( playerInfo, localMessagingInfo );

    RisePlayerConfiguration.Logger.configure();

    if ( RisePlayerConfiguration.isPreview()) {
      RisePlayerConfiguration.sendComponentsReadyEvent();
    } else {
      _configureLocalMessaging( localMessagingInfo );
    }

    if ( isInViewer ) {
      RisePlayerConfiguration.Viewer.startListeningForData();
    }

    if ( !isInViewer || RisePlayerConfiguration.Viewer.isFirstPresentationInSchedule()) {
      _sendRisePresentationPlayOnDocumentLoad();
    }

    if ( !RisePlayerConfiguration.Helpers.isTestEnvironment()) {
      _lockDownRisePlayerConfiguration();
    }
  }

  return {
    RISE_PLAYER_CONFIGURATION_DATA: {
      name: "RisePlayerConfiguration",
      id: "RisePlayerConfiguration",
      version: "N/A"
    },
    configure: configure,
    isConfigured() {
      return !!RisePlayerConfiguration.getPlayerInfo;
    },
    getChromeVersion: function() {
      const info = _getPlayerInfo();

      if ( info && info.chromeVersion ) {
        return info.chromeVersion;
      }

      const match = navigator.userAgent.match( /Chrom(e|ium)\/([0-9.]+)/ );

      return match ? match[ 2 ] : null;
    },
    getCompanyId: function() {
      var playerInfo = _getPlayerInfo();

      return playerInfo ? playerInfo.companyId : null;
    },
    getDisplayId: function() {
      var playerInfo = _getPlayerInfo();

      return playerInfo ? playerInfo.displayId || "preview" : "preview";
    },
    getPresentationId: function() {
      var playerInfo = _getPlayerInfo();

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
      console.log( `Dispatching ${name} event` );

      window.dispatchEvent( new CustomEvent( name ));
    },
    sendComponentsReadyEvent() {
      return Promise.resolve()
        .then(() => {
          RisePlayerConfiguration.dispatchWindowEvent( "rise-components-ready" );

          if ( RisePlayerConfiguration.Helpers.isInViewer()) {
            RisePlayerConfiguration.Viewer.send( "rise-components-ready" );
          }

          if ( !RisePlayerConfiguration.isPreview()) {
            RisePlayerConfiguration.Logger.info(
              RisePlayerConfiguration.RISE_PLAYER_CONFIGURATION_DATA,
              "rise-components-ready"
            );

            RisePlayerConfiguration.AttributeDataWatch.watchAttributeDataFile();
          } else {
            RisePlayerConfiguration.Preview.startListeningForData();
          }
        });
    },
    Helpers: null,
    LocalMessaging: null,
    LocalStorage: null,
    Logger: null
  };
})();
