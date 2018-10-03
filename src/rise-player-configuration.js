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

    RisePlayerConfiguration.LocalMessaging.configure( localMessagingInfo );

    //TODO: other processing

    // lock down RisePlayerConfiguration object
    Object.freeze( RisePlayerConfiguration );
  },
  isTestEnvironment: () => {
    return window.env && window.env.RISE_ENV && window.env.RISE_ENV === "test";
  },
  LocalMessaging: null,
  LocalStorage: null,
  Logger: null
};
