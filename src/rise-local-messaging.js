/* eslint-disable no-console */

RisePlayerConfiguration.LocalMessaging = (() => {

  const DEFAULT_CLIENT_NAME = "ws-client";

  let _connected = false,
    _clientName,
    _connectionType; // eslint-disable-line no-unused-vars

  function _broadcastWebsocketMessage() {
    // TODO
  }

  function _broadcastWindowMessage( msg ) {
    top.postToPlayer( Object.assign({}, { from: _clientName }, msg ));
  }

  function _isWindowConnectionAvailable() {
    // Need to reference window.top to account for running in a Rise Player that is still using Viewer
    try {
      if ( top.postToPlayer && typeof top.postToPlayer === "function" && top.receiveFromPlayer && typeof top.receiveFromPlayer === "function" ) {
        return true;
      }
    } catch ( err ) {
      console.log( "window.top reference error", err );
    }

    return false;
  }

  function _initWebsocketConnection() {
    // TODO
  }

  function _initWindowConnection() {
    _connected = _isWindowConnectionAvailable();
    _sendConnectionEvent();
  }

  function _receiveWebsocketMessages() {
    // TODO
  }

  function _receiveWindowMessages( handler ) {
    top.receiveFromPlayer( "local-messaging", handler );
  }

  function _resetForAutomatedTests() {
    if ( !window.env || !window.env.RISE_ENV || window.env.RISE_ENV !== "test" ) {
      return;
    }

    _connected = false;
    _connectionType = undefined;
    _clientName = undefined;
    // TODO: other things needing resetting
  }

  function _sendConnectionEvent() {
    window.dispatchEvent( new CustomEvent( "rise-local-messaging-connection", { detail: { isConnected: _connected } }));
  }

  function _validatePlayer( name ) {
    const players = [ "electron", "chromeos" ];

    if ( !name || typeof name !== "string" ) {
      return false;
    }

    return players.indexOf( name ) !== -1;
  }

  function broadcastMessage( message ) {
    if ( !message || !_connected ) {
      return;
    }

    const msg = typeof message === "string" ? { msg: message } : message;

    switch ( _connectionType ) {
    case "websocket":
      _broadcastWebsocketMessage( msg );
      break;
    case "window":
      _broadcastWindowMessage( msg );
      break;
    }
  }

  function configure( data ) {
    const { player, connectionType, detail = { clientName: DEFAULT_CLIENT_NAME } } = data;

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

    _clientName = detail.clientName;

    switch ( connectionType ) {
    case "websocket":
      _connectionType = "websocket";
      _initWebsocketConnection( detail );
      break;
    case "window":
      _connectionType = "window";
      _initWindowConnection();
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

  function receiveMessages( handler ) {
    if ( !handler || typeof handler !== "function" ) {
      return;
    }

    switch ( _connectionType ) {
    case "websocket":
      _receiveWebsocketMessages( handler );
      break;
    case "window":
      _receiveWindowMessages( handler );
      break;
    }

  }

  return {
    broadcastMessage: broadcastMessage,
    configure: configure,
    isConnected: isConnected,
    getConnectionType: getConnectionType,
    receiveMessages: receiveMessages
  }

})();
