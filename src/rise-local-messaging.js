/* eslint-disable no-console */

RisePlayerConfiguration.LocalMessaging = (() => {

  let _connected = false,
    _connectionType; // eslint-disable-line no-unused-vars

  function _initWebsocketConnection() {
    // TODO
  }

  function _resetForAutomatedTests() {
    if ( !window.env || !window.env.RISE_ENV || window.env.RISE_ENV !== "test" ) {
      return;
    }

    _connected = false;
    _connectionType = undefined;
    // TODO: other things needing resetting
  }

  function _validatePlayer( name ) {
    const players = [ "electron", "chromeos" ];

    if ( !name || typeof name !== "string" ) {
      return false;
    }

    return players.indexOf( name ) !== -1;
  }

  function configure( data ) {
    const { player, connectionType, detail = {} } = data;

    // automated testing purposes
    _resetForAutomatedTests();

    if ( _connectionType ) {
      console.log( "connection already configured" );
      return;
    }

    if ( !_validatePlayer( player )) {
      console.log( "player not supported", player );
      return;
    }

    if ( !connectionType || typeof connectionType !== "string" ) {
      console.log( "connection type not provided" );
      return;
    }

    switch ( connectionType ) {
    case "websocket":
      _connectionType = "websocket";
      _initWebsocketConnection( detail );
      break;
    case "window":
      _connectionType = "window";
      break;
    default:
      console.log( "connection type not supported", connectionType );
      break;
    }

  }

  // automated testing purposes
  function getConnectionType() {
    return _connectionType;
  }

  function isConnected() {
    return _connected;
  }

  return {
    broadcastMessage: () => {},
    configure: configure,
    isConnected: isConnected,
    getConnectionType: getConnectionType,
    receiveMessages: () => {}
  }

})();
