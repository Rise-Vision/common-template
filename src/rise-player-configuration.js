/* eslint-disable one-var */

const RisePlayerConfiguration = {
  ComponentLoader: null,
  configure: ( playerInfo, localMessagingInfo ) => {

    if ( !RisePlayerConfiguration.ComponentLoader ) {
      throw new Error( "RiseComponentLoader script was not loaded" );
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

    RisePlayerConfiguration.Logger.configure();
    RisePlayerConfiguration.LocalMessaging.configure( localMessagingInfo );

    //TODO: other processing

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
    // TODO: still not decided where this will come from.
    return "COMPANY_ID";
  },
  getDisplayId: function() {
    // TODO: still not decided where this will come from.
    return "DISPLAY_ID";
  },
  Helpers: null,
  LocalMessaging: null,
  LocalStorage: null,
  Logger: null
};
