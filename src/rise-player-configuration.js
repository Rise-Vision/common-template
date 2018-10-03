const RisePlayerConfiguration = {
  ComponentLoader: null,
  configure: ( playerInfo, localMessagingInfo ) => {

    if ( !RisePlayerConfiguration.LocalMessaging ) {
      throw new Error( "RiseLocalMessaging script was not loaded" );
    }
    if ( !RisePlayerConfiguration.LocalStorage ) {
      throw new Error( "RiseLocalStorage script was not loaded" );
    }
    if ( !RisePlayerConfiguration.Helpers ) {
      throw new Error( "RiseHelpers script was not loaded" );
    }

    RisePlayerConfiguration.LocalMessaging.configure( localMessagingInfo );

    //TODO: other processing

    // lock down RisePlayerConfiguration object
    Object.freeze( RisePlayerConfiguration );
  },
  Helpers: null,
  LocalMessaging: null,
  LocalStorage: null,
  Logger: null
};
